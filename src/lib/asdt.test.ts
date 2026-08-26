import { describe, it, expect } from "vitest";
import { generateAsdtReply, buildAsdtSystemPrompt } from "./asdt";
import type { StudentRecord } from "../data/mockData";

const chinedu: StudentRecord = {
  id: "stu2",
  name: "Chinedu Okafor",
  courseId: "csc201",
  lastActive: "2 hours ago",
  topics: [
    { topic: "Arrays", mastery: 88, status: "mastered", lastStudied: "1 day ago" },
    { topic: "Trees", mastery: 15, status: "struggling", lastStudied: "1 week ago" },
    { topic: "Recursion", mastery: 30, status: "struggling", lastStudied: "6 days ago" },
  ],
};

describe("generateAsdtReply", () => {
  it("identifies the weakest topic when asked about struggles", () => {
    const reply = generateAsdtReply("what is he struggling with?", chinedu);
    expect(reply).toContain("Trees");
    expect(reply).toContain("15%");
  });

  it("identifies the strongest topic when asked", () => {
    const reply = generateAsdtReply("what is his strongest area?", chinedu);
    expect(reply).toContain("Arrays");
  });

  it("reports last active time", () => {
    const reply = generateAsdtReply("when was he last active?", chinedu);
    expect(reply).toContain("2 hours ago");
  });

  it("reports overall mastery and flags struggling topic count", () => {
    const reply = generateAsdtReply("how is he doing overall?", chinedu);
    expect(reply).toMatch(/\d+% overall mastery/);
    expect(reply).toContain("2 topic(s)");
  });

  it("answers a specific topic query with that topic's data only", () => {
    const reply = generateAsdtReply("tell me about recursion", chinedu);
    expect(reply).toContain("Recursion");
    expect(reply).toContain("30%");
    expect(reply).not.toContain("Trees");
  });

  it("never fabricates a value not present in the student record", () => {
    const reply = generateAsdtReply("how is he doing overall?", chinedu);
    // every percentage mentioned must correspond to a real topic mastery value
    const mentioned = reply.match(/(\d+)%/g) ?? [];
    const validValues = chinedu.topics.map((t) => `${t.mastery}%`);
    const avg = Math.round(chinedu.topics.reduce((a, t) => a + t.mastery, 0) / chinedu.topics.length);
    for (const m of mentioned) {
      expect([...validValues, `${avg}%`]).toContain(m);
    }
  });
});

describe("buildAsdtSystemPrompt", () => {
  it("embeds only this student's real topic data", () => {
    const prompt = buildAsdtSystemPrompt(chinedu);
    expect(prompt).toContain("Trees: 15% mastery");
    expect(prompt).toContain("Chinedu Okafor");
  });
});
