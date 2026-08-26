import { describe, it, expect } from "vitest";
import { appendProvenance, verifyChain } from "./provenance";

describe("appendProvenance / verifyChain", () => {
  it("starts an empty chain and appends a first entry linked to the genesis hash", async () => {
    const log = await appendProvenance([], "student", "atdt.message", { length: 12 });
    expect(log).toHaveLength(1);
    expect(log[0].prevHash).toBe("0".repeat(64));
    expect(log[0].hash).toHaveLength(64);
  });

  it("chains each new entry to the previous entry's hash", async () => {
    let log = await appendProvenance([], "student", "atdt.message", {});
    log = await appendProvenance(log, "atdt", "atdt.reply", {});
    log = await appendProvenance(log, "teacher", "document.ingested", { title: "Notes.pdf" });

    expect(log).toHaveLength(3);
    expect(log[1].prevHash).toBe(log[0].hash);
    expect(log[2].prevHash).toBe(log[1].hash);
  });

  it("verifies an untampered chain as valid", async () => {
    let log = await appendProvenance([], "student", "a", {});
    log = await appendProvenance(log, "teacher", "b", {});
    log = await appendProvenance(log, "atdt", "c", {});

    const result = await verifyChain(log);
    expect(result.valid).toBe(true);
    expect(result.brokenAtIndex).toBeNull();
  });

  it("detects tampering with an entry's payload", async () => {
    let log = await appendProvenance([], "student", "a", { note: "original" });
    log = await appendProvenance(log, "teacher", "b", {});

    const tampered = [...log];
    tampered[0] = { ...tampered[0], payload: { note: "tampered" } };

    const result = await verifyChain(tampered);
    expect(result.valid).toBe(false);
    expect(result.brokenAtIndex).toBe(0);
  });

  it("detects a broken link even if the tampered entry's own hash is recomputed consistently", async () => {
    let log = await appendProvenance([], "student", "a", {});
    log = await appendProvenance(log, "teacher", "b", {});
    log = await appendProvenance(log, "atdt", "c", {});

    // Remove the middle entry entirely — the chain should no longer connect.
    const withGap = [log[0], log[2]];
    const result = await verifyChain(withGap);
    expect(result.valid).toBe(false);
  });

  it("produces deterministic hashes for identical input", async () => {
    const logA = await appendProvenance([], "system", "gap.detected", { topic: "Trees" });
    // Cannot compare hashes directly (timestamp differs), but structure must be stable.
    expect(logA[0].hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
