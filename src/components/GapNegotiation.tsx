import { ArrowRight } from "lucide-react";
import { videos, documents, student } from "../data/mockData";
import { useAppState } from "../state/AppState";
import { detectGaps, rankScaffolds } from "../lib/gaps";
import { TwinNegotiationLog } from "./TwinNegotiationLog";

export function GapNegotiation() {
  const { currentCourse, watchedVideoIds, messages, acceptScaffold, sessions } = useAppState();

  const atdtInteractionCount = messages.filter((m) => m.studentId === student.id && m.channel === "atdt" && m.sender === "student").length;
  const courseVideos = videos.filter((v) => v.courseId === currentCourse.id);
  const courseDocs = documents.filter((d) => d.courseId === currentCourse.id);

  const corroboration: Record<string, number> = {};
  for (const t of currentCourse.topics) {
    const watchedForTopic = courseVideos.filter((v) => watchedVideoIds.has(v.id) && v.title.toLowerCase().includes(t.topic.toLowerCase())).length;
    corroboration[t.topic] = watchedForTopic + (atdtInteractionCount > 0 ? 1 : 0);
  }

  const gaps = detectGaps(student.id, currentCourse.topics, corroboration).slice(0, 2);
  const alreadyScheduled = (title: string) => sessions.some((s) => s.title === `Scaffold: ${title}`);

  if (gaps.length === 0) return null;

  return (
    <div className="card card-pad">
      <div className="h2">
        <ArrowRight size={16} color="var(--coral)" /> ASDT ⇄ ATDT Negotiation
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>
        This is the actual Tutoring Channel exchange — your ASDT detected a gap, published a structured descriptor, and
        your teacher's ATDT proposed ranked scaffolding in response. Nothing here is scripted copy; it's the live output
        of <code>detectGaps()</code> and <code>rankScaffolds()</code>.
      </p>
      <div className="stack">
        {gaps.map((gap) => {
          const candidates = rankScaffolds(gap, courseVideos, courseDocs, watchedVideoIds).slice(0, 2);
          const accepted = candidates.find((c) => alreadyScheduled(c.title));
          return (
            <div key={gap.id} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div className="row-between" style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--navy)" }}>{gap.topic}</span>
                <span className="badge" style={{ background: "rgba(255,61,0,0.08)", color: "var(--red)" }}>
                  {gap.gapType}
                </span>
              </div>

              <TwinNegotiationLog gap={gap} candidates={candidates} acceptedTitle={accepted?.title} />

              {!accepted && candidates.length > 0 && (
                <div className="stack" style={{ marginTop: 8, gap: 4 }}>
                  {candidates.map((c) => (
                    <button key={c.refId} className="btn btn-outline" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => acceptScaffold(gap, c)}>
                      Accept: {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
