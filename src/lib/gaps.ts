import type { Topic, VideoItem, CourseDocument } from "../data/mockData";

// A simplified, single-process implementation of the "Tutoring Channel"
// negotiation described in the ATDT/ASDT architecture: the student twin
// detects a knowledge gap against the curriculum model (Topic.mastery),
// requires corroborating evidence from a second interaction type before
// publishing it (avoiding false positives from mere disengagement), and
// the teacher twin ranks candidate scaffolding interventions in response.

export interface GapDescriptor {
  id: string;
  studentId: string;
  topic: string;
  gapType: "struggling" | "stalled";
  evidence: string[];
  zpdEstimate: number;
  detectedAt: string;
}

export function detectGaps(
  studentId: string,
  topics: Topic[],
  corroboratingInteractionCounts: Record<string, number>
): GapDescriptor[] {
  return topics
    .filter((t) => t.status === "struggling" || t.status === "learning")
    .filter((t) => (corroboratingInteractionCounts[t.topic] ?? 0) >= 1)
    .map((t) => ({
      id: `gap-${studentId}-${t.topic.replace(/\s+/g, "-").toLowerCase()}`,
      studentId,
      topic: t.topic,
      gapType: (t.status === "struggling" ? "struggling" : "stalled") as "struggling" | "stalled",
      evidence: [
        `mastery estimate ${t.mastery}% (${t.status})`,
        `${corroboratingInteractionCounts[t.topic]} corroborating tutoring interaction(s) logged`,
      ],
      zpdEstimate: t.mastery,
      detectedAt: new Date().toISOString(),
    }))
    .sort((a, b) => a.zpdEstimate - b.zpdEstimate);
}

export interface ScaffoldCandidate {
  gapId: string;
  title: string;
  kind: "video" | "document";
  refId: string;
  estMinutes: number;
  score: number;
}

// Ranks candidate scaffolds for a gap: matching-topic material first,
// shorter time-to-complete preferred (lower cost of remediation), with a
// small bonus for material the student has not yet consumed.
export function rankScaffolds(
  gap: GapDescriptor,
  videos: VideoItem[],
  documents: CourseDocument[],
  watchedVideoIds: Set<string>
): ScaffoldCandidate[] {
  const candidates: ScaffoldCandidate[] = [];

  for (const v of videos) {
    if (v.title.toLowerCase().includes(gap.topic.toLowerCase()) || v.module.toLowerCase().includes(gap.topic.toLowerCase())) {
      const minutes = v.durationSeconds / 60;
      const unseenBonus = watchedVideoIds.has(v.id) ? 0 : 8;
      candidates.push({
        gapId: gap.id,
        title: v.title,
        kind: "video",
        refId: v.id,
        estMinutes: Math.round(minutes),
        score: 100 - minutes + unseenBonus,
      });
    }
  }

  for (const d of documents) {
    if (d.topic.toLowerCase() === gap.topic.toLowerCase()) {
      const minutes = d.pages * 2;
      candidates.push({
        gapId: gap.id,
        title: d.title,
        kind: "document",
        refId: d.id,
        estMinutes: minutes,
        score: 90 - minutes,
      });
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}
