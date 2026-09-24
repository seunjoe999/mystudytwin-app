// Self-hosted server for running MyStudyTwin outside Vercel (e.g. on the
// same VPS as CompCare Hub). Replaces the two Vercel serverless functions
// (api/chat.ts, api/sync.ts) with equivalent Express routes — same request/
// response shapes, same env vars, same fallback behaviour — so the frontend
// needs no changes at all. Also serves the built frontend (dist/).
import express from 'express'
import { Redis } from 'ioredis'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

// ── /api/chat — proxies to whichever AI provider has a key configured ──────
// Mirrors api/chat.ts: GEMINI_API_KEY, then OLLAMA_API_KEY, then
// ANTHROPIC_API_KEY, then OPENAI_API_KEY. No key configured -> 501, and the
// client falls back to its offline template-based tutor.
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
const ollamaCloudModel = process.env.OLLAMA_CLOUD_MODEL || 'gpt-oss:20b'

app.get('/api/chat', (req, res) => {
  const backend = process.env.GEMINI_API_KEY
    ? { backend: 'gemini', model: geminiModel }
    : process.env.OLLAMA_API_KEY
      ? { backend: 'ollama-cloud', model: ollamaCloudModel }
      : process.env.ANTHROPIC_API_KEY
        ? { backend: 'anthropic', model: 'claude-3-5-haiku-latest' }
        : process.env.OPENAI_API_KEY
          ? { backend: 'openai', model: 'gpt-4o-mini' }
          : { backend: 'none' }
  res.json(backend)
})

app.post('/api/chat', async (req, res) => {
  const { systemPrompt, userMessage } = req.body || {}
  const geminiKey = process.env.GEMINI_API_KEY
  const ollamaCloudKey = process.env.OLLAMA_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  try {
    if (geminiKey) {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        }
      )
      if (!r.ok) return res.status(502).json({ error: 'Upstream error (Gemini)' })
      const data = await r.json()
      return res.json({ text: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null })
    }

    if (ollamaCloudKey) {
      const r = await fetch('https://ollama.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ollamaCloudKey}` },
        body: JSON.stringify({
          model: ollamaCloudModel,
          stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      })
      if (!r.ok) return res.status(502).json({ error: 'Upstream error (Ollama Cloud)' })
      const data = await r.json()
      return res.json({ text: data?.message?.content ?? null })
    }

    if (anthropicKey) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      })
      if (!r.ok) return res.status(502).json({ error: 'Upstream error' })
      const data = await r.json()
      return res.json({ text: data?.content?.[0]?.text ?? null })
    }

    if (openaiKey) {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 500,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
        }),
      })
      if (!r.ok) return res.status(502).json({ error: 'Upstream error' })
      const data = await r.json()
      return res.json({ text: data?.choices?.[0]?.message?.content ?? null })
    }

    return res.status(501).json({ error: 'No AI backend configured' })
  } catch {
    res.status(500).json({ error: 'Backend request failed' })
  }
})

// ── /api/sync — Redis-backed cross-device sync ─────────────────────────────
// Mirrors api/sync.ts exactly, including the 2000-item ltrim cap and the
// 501-when-unconfigured fallback (client keeps using localStorage only).
const STREAMS = new Set(['messages', 'documents', 'questions'])

let redisClient
function getRedis() {
  if (redisClient !== undefined) return redisClient
  const url = process.env.REDIS_URL
  if (!url) {
    redisClient = null
    return null
  }
  redisClient = new Redis(url, { maxRetriesPerRequest: 2, connectTimeout: 5000 })
  redisClient.on('error', () => { /* swallow — callers already handle a failed op via try/catch */ })
  return redisClient
}

app.get('/api/sync', async (req, res) => {
  const redis = getRedis()
  if (!redis) return res.status(501).json({ error: 'No cloud datastore configured' })

  const stream = req.query.stream
  if (!stream || !STREAMS.has(stream)) return res.status(400).json({ error: 'Unknown stream' })
  const key = `mystudytwin:${stream}`

  try {
    const raw = await redis.lrange(key, 0, -1)
    res.json({ items: raw.map((r) => JSON.parse(r)) })
  } catch {
    res.status(500).json({ error: 'Datastore request failed' })
  }
})

app.post('/api/sync', async (req, res) => {
  const redis = getRedis()
  if (!redis) return res.status(501).json({ error: 'No cloud datastore configured' })

  const stream = req.query.stream
  if (!stream || !STREAMS.has(stream)) return res.status(400).json({ error: 'Unknown stream' })
  const key = `mystudytwin:${stream}`

  try {
    await redis.rpush(key, JSON.stringify(req.body))
    await redis.ltrim(key, -2000, -1)
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Datastore request failed' })
  }
})

// ── Static frontend ──────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`MyStudyTwin running on port ${PORT}`)
})
