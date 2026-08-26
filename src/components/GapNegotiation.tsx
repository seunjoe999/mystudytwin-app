import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { videos, documents, student } from "../data/mockData";
import { useAppState } from "../state/AppState";
import { detectGaps, rankScaffolds } from "../lib/gaps";

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
        <AlertTriangle size={16} color="var(--coral)" /> Gap &amp; Scaffold Negotiation
      </div>
      <p className="muted" style={{ marginBottom: 12 }}>
        Your ASDT detected these gaps against the curriculum model and asked the ATDT for scaffolding. Pick one to schedule it.
      </p>
      <div className="stack">
        {gaps.map((gap) => {
          const candidates = rankScaffolds(gap, courseVideos, courseDocs, watchedVideoIds).slice(0, 2);
          return (
            <div key={gap.id} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div className="row-between" style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--navy)" }}>{gap.topic}</span>
                <span className="badge" style={{ background: "rgba(255,61,0,0.08)", color: "var(--red)" }}>
                  {gap.gapType}
                </span>
              </div>
              <p className="muted" style={{ fontSize: 11, marginBottom: 8 }}>{gap.evidence.join(" · ")}</p>
              {candidates.map((c) => {
                const scheduled = alreadyScheduled(c.title);
                return (
                  <div key={c.refId} className="row-between" style={{ padding: "6px 0" }}>
                    <span style={{ fontSize: 12 }}>
                      {c.kind === "video" ? "▶" : "📄"} {c.title} <span className="muted">~{c.estMinutes} min</span>
                    </span>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "3px 10px", fontSize: 11 }}
                      disabled={scheduled}
                      onClick={() => acceptScaffold(gap, c)}
                    >
                      {scheduled ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={12} /> Scheduled
                        </span>
                      ) : (
                        "Accept"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
