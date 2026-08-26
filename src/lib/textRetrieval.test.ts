import { describe, it, expect } from "vitest";
import { quickSummary, findRelevantPassage } from "./textRetrieval";

describe("quickSummary", () => {
  it("returns all sentences unchanged when already short", () => {
    const text = "Recursion needs a base case. It also needs a recursive case.";
    expect(quickSummary(text, 3)).toBe(text);
  });

  it("selects the longest, most content-dense sentences when text is long", () => {
    const text =
      "Ok. " +
      "Recursion requires a well-defined base case that terminates the call chain reliably. " +
      "Yes. " +
      "The recursive case must make measurable progress toward that base case on every call.";
    const summary = quickSummary(text, 2);
    expect(summary).toContain("base case that terminates");
    expect(summary).toContain("recursive case must make measurable progress");
    expect(summary).not.toContain("Ok.");
  });

  it("ignores trivially short fragments entirely", () => {
    const text = "Hi. Ok. No. Recursion is the repeated application of a function to its own output on smaller input.";
    const summary = quickSummary(text, 1);
    expect(summary).toContain("repeated application");
  });
});

describe("findRelevantPassage", () => {
  const doc =
    "Chapter one covers arrays and contiguous memory layout. ".repeat(3) +
    "Chapter two covers recursion, base cases, and the call stack in detail. ".repeat(3) +
    "Chapter three covers hash tables and collision resolution strategies. ".repeat(3);

  it("returns null for empty source text", () => {
    expect(findRelevantPassage("", "recursion")).toBeNull();
  });

  it("returns the chunk most relevant to the query's keywords", () => {
    const passage = findRelevantPassage(doc, "explain recursion base cases", 200);
    expect(passage).toContain("recursion");
  });

  it("falls back to the first chunk when no keywords match anything", () => {
    const passage = findRelevantPassage(doc, "quantum entanglement", 200);
    expect(passage).toBeNull();
  });

  it("ignores short stop-word-like query terms and still finds a match", () => {
    const passage = findRelevantPassage(doc, "the hash tables and how they work", 200);
    expect(passage).toContain("hash tables");
  });
});
