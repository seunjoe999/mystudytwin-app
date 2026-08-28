// Vercel serverless function — shared cloud state for cross-device sync.
//
// Backs the ASDT/ATDT "channels" (messages, documents, questions) with a
// real Redis store (Upstash, via Vercel's Storage marketplace) so that a
// student logged in on one device and a teacher logged in on another see
// the same data, instead of each device's isolated localStorage.
//
// Activates only if REDIS env vars are configured (Vercel Dashboard ->
// Storage -> Create Database -> Redis -> Connect to Project). Without
// that, this returns 501 and the client silently keeps using
// localStorage-only state, exactly as it did before — no regression.

import { Redis } from "@upstash/redis";

export const config = { runtime: "edge" };

declare const process: { env: Record<string, string | undefined> };

const STREAMS = new Set(["messages", "documents", "questions"]);

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export default async function handler(req: Request): Promise<Response> {
  const redis = getRedis();
  if (!redis) {
    return new Response(JSON.stringify({ error: "No cloud datastore configured" }), { status: 501 });
  }

  const { searchParams } = new URL(req.url);
  const stream = searchParams.get("stream") || "";
  if (!STREAMS.has(stream)) {
    return new Response(JSON.stringify({ error: "Unknown stream" }), { status: 400 });
  }
  const key = `mystudytwin:${stream}`;

  if (req.method === "GET") {
    const items = await redis.lrange<Record<string, unknown>>(key, 0, -1);
    return new Response(JSON.stringify({ items }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  if (req.method === "POST") {
    const item = await req.json();
    await redis.rpush(key, item);
    // Cap the log so a long demo session can't grow the list unbounded.
    await redis.ltrim(key, -2000, -1);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
}
