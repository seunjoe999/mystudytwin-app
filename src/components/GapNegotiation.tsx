import { ArrowRight, CheckCircle2 } from "lucide-react";
import { videos, documents, student, teacher } from "../data/mockData";
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
              <div className="row-between" style={{ marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "var(--navy)" }}>{gap.topic}</span>
                <span className="badge" style={{ background: "rgba(255,61,0,0.08)", color: "var(--red)" }}>
                  {gap.gapType}
                </span>
              </div>

              {/* ASDT -> ATDT */}
              <div className="chat-bubble me" style={{ maxWidth: "100%", marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  ASDT → ATDT · gap.descriptor
                </div>
                topic: <strong>{gap.topic}</strong> · zpdEstimate: {gap.zpdEstimate}%
                <br />
                evidence: {gap.evidence.join("; ")}
              </div>

              {/* ATDT -> ASDT */}
              <div className="chat-bubble them" style={{ maxWidth: "100%", marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  ATDT → ASDT · scaffold.candidates ({candidates.length})
                </div>
                {candidates.length === 0 && <span className="muted">No matching material found for this topic yet.</span>}
                {candidates.map((c, i) => (
                  <div key={c.refId} className="row-between" style={{ padding: "5px 0", borderTop: i > 0 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                    <span style={{ fontSize: 12 }}>
                      {i + 1}. {c.kind === "video" ? "▶" : "📄"} {c.title} <span className="muted">~{c.estMinutes} min</span>
                    </span>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "3px 10px", fontSize: 11 }}
                      disabled={!!accepted}
                      onClick={() => acceptScaffold(gap, c)}
                    >
                      {alreadyScheduled(c.title) ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={12} /> Accepted
                        </span>
                      ) : (
                        "Accept"
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* ASDT -> ATDT (confirmation, only once accepted) */}
              {accepted && (
                <div className="chat-bubble me" style={{ maxWidth: "100%" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>
                    ASDT → ATDT · scaffold.accept
                  </div>
                  Scheduled "{accepted.title}" and logged to the provenance chain — {teacher.name}'s ATDT can see this in
                  the roster view.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
