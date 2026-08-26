import { describe, it, expect } from "vitest";
import { generateAtdtReply, buildAtdtSystemPrompt } from "./atdt";
import type { CourseDocument, Topic } from "../data/mockData";

const topics: Topic[] = [
  { topic: "Recursion", mastery: 45, status: "struggling", lastStudied: "3 days ago" },
  { topic: "Arrays", mastery: 92, status: "mastered", lastStudied: "2 days ago" },
];

const docs: CourseDocument[] = [
  {
    id: "d1",
    title: "Recursion Cheat Sheet.pdf",
    courseId: "csc201",
    module: "Module 5",
    topic: "Recursion",
    pages: 6,
    sizeKb: 400,
    uploadedBy: "Dr. Ade Bello",
    summary: "Base-case patterns and common exam pitfalls.",
    content: "Recursion requires a base case that terminates the call chain and a recursive case that makes measurable progress toward it.",
  },
];

describe("generateAtdtReply", () => {
  it("greets on a greeting message", () => {
    const reply = generateAtdtReply("hello", docs, topics);
    expect(reply.toLowerCase()).toContain("atdt");
  });

  it("returns empty-input guidance for a blank question", () => {
    const reply = generateAtdtReply("   ", docs, topics);
    expect(reply.length).toBeGreaterThan(0);
  });

  it("grounds a topic answer in the digested document content when available", () => {
    const reply = generateAtdtReply("explain recursion", docs, topics);
    expect(reply).toContain("base case");
    expect(reply).toContain("45%");
  });

  it("cites the document title when only the document (not a mastery topic) matches", () => {
    const noTopicDocs: CourseDocument[] = [{ ...docs[0], topic: "Trees" }];
    const reply = generateAtdtReply("trees", noTopicDocs, topics);
    expect(reply).toContain("Recursion Cheat Sheet.pdf");
  });

  it("lists ingested materials when asked what was uploaded", () => {
    const reply = generateAtdtReply("what materials have you uploaded?", docs, topics);
    expect(reply).toContain("Recursion Cheat Sheet.pdf");
  });

  it("falls back to a generic prompt for unrelated questions", () => {
    const reply = generateAtdtReply("what is the weather today", docs, topics);
    expect(reply.length).toBeGreaterThan(0);
  });
});

describe("buildAtdtSystemPrompt", () => {
  it("includes the student's mastery data and retrieved passage in the prompt", () => {
    const prompt = buildAtdtSystemPrompt("CSC 201: Data Structures", docs, topics, "explain recursion");
    expect(prompt).toContain("Recursion: 45% mastery");
    expect(prompt).toContain("base case");
  });

  it("notes when no relevant material is found", () => {
    const prompt = buildAtdtSystemPrompt("CSC 201: Data Structures", [], topics, "explain graphs");
    expect(prompt.toLowerCase()).toContain("no directly relevant");
  });
});
