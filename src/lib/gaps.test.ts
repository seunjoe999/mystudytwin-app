import { describe, it, expect } from "vitest";
import { detectGaps, rankScaffolds } from "./gaps";
import type { Topic, VideoItem, CourseDocument } from "../data/mockData";

const topics: Topic[] = [
  { topic: "Trees", mastery: 25, status: "struggling", lastStudied: "5 days ago" },
  { topic: "Arrays", mastery: 92, status: "mastered", lastStudied: "2 days ago" },
  { topic: "Recursion", mastery: 45, status: "struggling", lastStudied: "3 days ago" },
];

describe("detectGaps", () => {
  it("does not surface a gap without corroborating evidence (avoids flagging mere disengagement)", () => {
    const gaps = detectGaps("stu1", topics, {});
    expect(gaps).toHaveLength(0);
  });

  it("surfaces a gap once at least one corroborating interaction is recorded", () => {
    const gaps = detectGaps("stu1", topics, { Trees: 1 });
    expect(gaps).toHaveLength(1);
    expect(gaps[0].topic).toBe("Trees");
    expect(gaps[0].gapType).toBe("struggling");
  });

  it("never surfaces a mastered topic as a gap regardless of interaction count", () => {
    const gaps = detectGaps("stu1", topics, { Arrays: 5 });
    expect(gaps.find((g) => g.topic === "Arrays")).toBeUndefined();
  });

  it("orders multiple gaps by severity (lowest mastery first)", () => {
    const gaps = detectGaps("stu1", topics, { Trees: 1, Recursion: 1 });
    expect(gaps.map((g) => g.topic)).toEqual(["Trees", "Recursion"]);
  });

  it("includes the mastery estimate and interaction count as evidence", () => {
    const gaps = detectGaps("stu1", topics, { Trees: 2 });
    expect(gaps[0].evidence.join(" ")).toContain("25%");
    expect(gaps[0].evidence.join(" ")).toContain("2 corroborating");
  });
});

describe("rankScaffolds", () => {
  const videos: VideoItem[] = [
    {
      id: "v1",
      title: "Trees & BST Introduction",
      courseId: "csc201",
      module: "Module 6",
      duration: "18:10",
      durationSeconds: 1090,
      description: "",
      tags: [],
      thumbnailGradient: "",
    },
    {
      id: "v2",
      title: "Arrays vs Linked Lists",
      courseId: "csc201",
      module: "Module 6",
      duration: "5:00",
      durationSeconds: 300,
      description: "",
      tags: [],
      thumbnailGradient: "",
    },
  ];

  const docs: CourseDocument[] = [
    {
      id: "d1",
      title: "Trees & BST Slides.pdf",
      courseId: "csc201",
      module: "Module 6",
      topic: "Trees",
      pages: 24,
      sizeKb: 1500,
      uploadedBy: "Dr. Ade Bello",
      summary: "",
    },
  ];

  it("only ranks candidates matching the gap's topic", () => {
    const gap = detectGaps("stu1", topics, { Trees: 1 })[0];
    const ranked = rankScaffolds(gap, videos, docs, new Set());
    expect(ranked.every((c) => c.title.toLowerCase().includes("trees"))).toBe(true);
  });

  it("prefers unwatched shorter videos over longer or already-watched ones", () => {
    const shortVideo: VideoItem = { ...videos[0], id: "v3", title: "Trees Quick Refresher", durationSeconds: 120 };
    const gap = detectGaps("stu1", topics, { Trees: 1 })[0];
    const ranked = rankScaffolds(gap, [videos[0], shortVideo], [], new Set());
    expect(ranked[0].refId).toBe("v3");
  });

  it("returns an empty list when nothing matches the topic", () => {
    const gap = detectGaps("stu1", topics, { Recursion: 1 })[0];
    const ranked = rankScaffolds(gap, videos, docs, new Set());
    expect(ranked).toHaveLength(0);
  });
});
