// Vercel serverless function — optional hosted-AI backend.
//
// This only activates if the deployment has an API key configured in its
// environment variables (Vercel Project Settings -> Environment Variables).
// Without one, it returns 501 and the client falls back to the offline
// template-based tutor logic, so the app works perfectly with zero setup.
//
// Supported, checked in this order: GEMINI_API_KEY (Google Gemini — has a
// free tier, so it's the recommended default for this project), then
// OLLAMA_API_KEY (Ollama Cloud/Turbo), then ANTHROPIC_API_KEY (Claude),
// then OPENAI_API_KEY (GPT).

export const config = { runtime: "edge" };

declare const process: { env: Record<string, string | undefined> };

interface ChatBody {
  systemPrompt: string;
  userMessage: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const { systemPrompt, userMessage } = (await req.json()) as ChatBody;

  const geminiKey = process.env.GEMINI_API_KEY;
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const ollamaCloudKey = process.env.OLLAMA_API_KEY;
  const ollamaCloudModel = process.env.OLLAMA_CLOUD_MODEL || "gpt-oss:20b";
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  try {
    if (geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
          }),
        }
      );
      if (!res.ok) return new Response(JSON.stringify({ error: "Upstream error (Gemini)" }), { status: 502 });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      return new Response(JSON.stringify({ text }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (ollamaCloudKey) {
      const res = await fetch("https://ollama.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ollamaCloudKey}`,
        },
        body: JSON.stringify({
          model: ollamaCloudModel,
          stream: false,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });
      if (!res.ok) return new Response(JSON.stringify({ error: "Upstream error (Ollama Cloud)" }), { status: 502 });
      const data = await res.json();
      const text = data?.message?.content ?? null;
      return new Response(JSON.stringify({ text }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (anthropicKey) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-latest",
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
      });
      if (!res.ok) return new Response(JSON.stringify({ error: "Upstream error" }), { status: 502 });
      const data = await res.json();
      const text = data?.content?.[0]?.text ?? null;
      return new Response(JSON.stringify({ text }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 500,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });
      if (!res.ok) return new Response(JSON.stringify({ error: "Upstream error" }), { status: 502 });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content ?? null;
      return new Response(JSON.stringify({ text }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "No AI backend configured" }), { status: 501 });
  } catch {
    return new Response(JSON.stringify({ error: "Backend request failed" }), { status: 500 });
  }
}
