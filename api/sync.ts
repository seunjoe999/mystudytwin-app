// Vercel serverless function — shared cloud state for cross-device sync.
//
// Backs the ASDT/ATDT "channels" (messages, documents, questions) with a
// real Redis store (connected via Vercel's Storage marketplace) so that a
// student logged in on one device and a teacher logged in on another see
// the same data, instead of each device's isolated localStorage.
//
// Runs on the Node.js serverless runtime (not Edge) because it needs a
// plain TCP connection to Redis via REDIS_URL, which Edge's isolate
// cannot open. Activates only if REDIS_URL is configured (Vercel
// Dashboard -> Storage -> Create Database -> Redis -> Connect to
// Project). Without it, this returns 501 and the client silently keeps
// using localStorage-only state — no regression.

import Redis from "ioredis";

declare const process: { env: Record<string, string | undefined> };

const STREAMS = new Set(["messages", "documents", "questions"]);

// Reused across warm invocations of the same serverless instance.
let client: Redis | null | undefined;

function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.REDIS_URL;
  if (!url) {
    client = null;
    return null;
  }
  client = new Redis(url, { maxRetriesPerRequest: 2, connectTimeout: 5000 });
  client.on("error", () => {
    /* swallow — callers already handle a failed op via try/catch */
  });
  return client;
}

export default async function handler(
  req: { method?: string; query: Record<string, string | string[] | undefined>; body?: unknown },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
  }
) {
  const redis = getRedis();
  if (!redis) {
    res.status(501).json({ error: "No cloud datastore configured" });
    return;
  }

  const streamParam = req.query.stream;
  const stream = Array.isArray(streamParam) ? streamParam[0] : streamParam;
  if (!stream || !STREAMS.has(stream)) {
    res.status(400).json({ error: "Unknown stream" });
    return;
  }
  const key = `mystudytwin:${stream}`;

  try {
    if (req.method === "GET") {
      const raw = await redis.lrange(key, 0, -1);
      const items = raw.map((r) => JSON.parse(r));
      res.status(200).json({ items });
      return;
    }

    if (req.method === "POST") {
      const item = req.body;
      await redis.rpush(key, JSON.stringify(item));
      await redis.ltrim(key, -2000, -1);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch {
    res.status(500).json({ error: "Datastore request failed" });
  }
}
