// Client-side helper for the shared cloud state (see api/sync.ts). Every
// call fails silently (returns null / no-ops) if the deployment has no
// cloud datastore configured, so the app keeps working exactly as before
// — localStorage only, single-device — until a store is connected.

export type SyncStream = "messages" | "documents" | "questions";

export async function fetchStream<T>(stream: SyncStream): Promise<T[] | null> {
  try {
    const res = await fetch(`/api/sync?stream=${stream}`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data.items ?? null) as T[] | null;
  } catch {
    return null;
  }
}

export async function postToStream<T>(stream: SyncStream, item: T): Promise<boolean> {
  try {
    const res = await fetch(`/api/sync?stream=${stream}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    return res.ok;
  } catch {
    return false;
  }
}
