// A client-side, hash-chained provenance log: every twin decision (a
// message sent, a document ingested, a scaffold accepted) is appended as
// an entry whose hash depends on the previous entry's hash, so any
// retroactive edit to an earlier entry is detectable by recomputing the
// chain. This is a single-session, browser-local integrity mechanism —
// not a distributed or server-anchored ledger — but it demonstrates the
// same tamper-evidence principle the full architecture calls for.

export type ProvenanceActor = "student" | "teacher" | "atdt" | "asdt" | "system";

export interface ProvenanceEntry {
  id: string;
  timestamp: string;
  actor: ProvenanceActor;
  action: string;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

const GENESIS_HASH = "0".repeat(64);

async function sha256Hex(data: string): Promise<string> {
  const bytes = new TextEncoder().encode(data);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function entryPayloadString(id: string, timestamp: string, actor: ProvenanceActor, action: string, payload: Record<string, unknown>, prevHash: string) {
  return JSON.stringify({ id, timestamp, actor, action, payload, prevHash });
}

export async function appendProvenance(
  log: ProvenanceEntry[],
  actor: ProvenanceActor,
  action: string,
  payload: Record<string, unknown> = {}
): Promise<ProvenanceEntry[]> {
  const prevHash = log.length ? log[log.length - 1].hash : GENESIS_HASH;
  const id = `p${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = new Date().toISOString();
  const hash = await sha256Hex(entryPayloadString(id, timestamp, actor, action, payload, prevHash));
  return [...log, { id, timestamp, actor, action, payload, prevHash, hash }];
}

export interface ChainVerification {
  valid: boolean;
  brokenAtIndex: number | null;
}

export async function verifyChain(log: ProvenanceEntry[]): Promise<ChainVerification> {
  let expectedPrevHash = GENESIS_HASH;
  for (let i = 0; i < log.length; i++) {
    const entry = log[i];
    if (entry.prevHash !== expectedPrevHash) {
      return { valid: false, brokenAtIndex: i };
    }
    const recomputed = await sha256Hex(
      entryPayloadString(entry.id, entry.timestamp, entry.actor, entry.action, entry.payload, entry.prevHash)
    );
    if (recomputed !== entry.hash) {
      return { valid: false, brokenAtIndex: i };
    }
    expectedPrevHash = entry.hash;
  }
  return { valid: true, brokenAtIndex: null };
}
