import { Link } from "react-router-dom";
import { Brain, BookOpen, Users, MessageCircle, Zap, ArrowRight } from "lucide-react";
import { students, documents, teacher, statusColor, videos } from "../data/mockData";
import { useAppState } from "../state/AppState";
import { CognitiveProfileContent } from "./CognitiveProfileContent";
import { AsdtChat } from "./AsdtChat";
import { detectGaps, rankScaffolds } from "../lib/gaps";

export function TeacherCognitiveProfile() {
  const { currentCourse, selectedStudentId, setSelectedStudentId, closeCognitive, messages, sessions } = useAppState();
  const courseDocs = documents.filter((d) => d.courseId === currentCourse.id);
  const courseVideos = videos.filter((v) => v.courseId === currentCourse.id);

  const roster = [...students.filter((s) => s.courseId === currentCourse.id)].sort((a, b) => {
    const avgA = a.topics.reduce((s, t) => s + t.mastery, 0) / a.topics.length;
    const avgB = b.topics.reduce((s, t) => s + t.mastery, 0) / b.topics.length;
    return avgA - avgB;
  });
  const selected = roster.find((s) => s.id === selectedStudentId) ?? roster[0];

  const classAvg = Math.round(
    roster.reduce((sum, s) => sum + s.topics.reduce((a, t) => a + t.mastery, 0) / s.topics.length, 0) / roster.length
  );

  const topicRisk = new Map<string, number>();
  roster.forEach((s) =>
    s.topics.forEach((t) => {
      if (t.status === "struggling") topicRisk.set(t.topic, (topicRisk.get(t.topic) ?? 0) + 1);
    })
  );
  const riskiestTopic = [...topicRisk.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <div>
      <div className="h2" style={{ marginBottom: 16 }}>
        <Brain size={18} color="#001f5b" />
        Teaching Twin — {teacher.name}
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <span className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpen size={14} /> Materials ingested
          </span>
          <span style={{ fontWeight: 700, color: "var(--navy)" }}>{courseDocs.length}</span>
        </div>
        <div className="row-between">
          <span className="muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={14} /> Class average mastery
          </span>
          <span style={{ fontWeight: 700, color: "var(--navy)" }}>{classAvg}%</span>
        </div>
      </div>

      {riskiestTopic && (
        <div
          className="card card-pad"
          style={{ marginBottom: 16, background: "linear-gradient(135deg,#001f5b,#001f5bcc)", color: "#fff", border: "none" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Zap size={14} color="#00e5ff" />
            <span style={{ fontSize: 13, fontWeight: 700 }}>Class Insight</span>
          </div>
          <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
            <strong>{riskiestTopic[0]}</strong> is the most common struggle area — {riskiestTopic[1]} of {roster.length}{" "}
            student(s) are flagged. Consider a review session or a new "{riskiestTopic[0]}" practice set.
          </p>
        </div>
      )}

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="h2">Roster — {currentCourse.code} (sorted by risk)</div>
        {roster.map((s) => {
          const avg = Math.round(s.topics.reduce((a, t) => a + t.mastery, 0) / s.topics.length);
          const worstStatus = s.topics.some((t) => t.status === "struggling")
            ? "struggling"
            : s.topics.some((t) => t.status === "learning")
            ? "learning"
            : "mastered";
          return (
            <div
              key={s.id}
              onClick={() => setSelectedStudentId(s.id)}
              className="row-between"
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 6,
                background: selected?.id === s.id ? "rgba(0,31,91,0.06)" : "transparent",
                border: selected?.id === s.id ? "1px solid var(--navy)" : "1px solid transparent",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>
                <span className="dot" style={{ background: statusColor(worstStatus) }} />
                {s.name}
              </span>
              <span className="muted">{avg}%</span>
            </div>
          );
        })}
      </div>

      {selected && (
        <>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="muted">Viewing knowledge map for</span>
            <Link
              to="/messages"
              onClick={closeCognitive}
              style={{ fontSize: 12, color: "var(--coral)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
            >
              <MessageCircle size={13} /> Message {selected.name.split(" ")[0]}
            </Link>
          </div>
          <div style={{ marginBottom: 16 }}>
            <CognitiveProfileContent topics={selected.topics} courseCode={currentCourse.code} ownerName={selected.name} showFocusState={false} />
          </div>

          {(() => {
            const atdtCount = messages.filter((m) => m.studentId === selected.id && m.channel === "atdt" && m.sender === "student").length;
            const corroboration: Record<string, number> = {};
            for (const t of selected.topics) corroboration[t.topic] = atdtCount > 0 ? 1 : 0;
            const gaps = detectGaps(selected.id, selected.topics, corroboration).slice(0, 1);
            if (gaps.length === 0) return null;
            const gap = gaps[0];
            const candidates = rankScaffolds(gap, courseVideos, courseDocs, new Set()).slice(0, 2);
            const accepted = candidates.find((c) => sessions.some((s) => s.title === `Scaffold: ${c.title}`));
            return (
              <div className="card card-pad" style={{ marginBottom: 16 }}>
                <div className="h2">
                  <ArrowRight size={16} color="var(--coral)" /> ASDT ⇄ ATDT Negotiation (live)
                </div>
                <p className="muted" style={{ marginBottom: 10 }}>
                  This is {selected.name}'s ASDT talking to your ATDT in real time — the same negotiation their device shows.
                </p>
                <div className="chat-bubble me" style={{ maxWidth: "100%", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, marginBottom: 3, textTransform: "uppercase" }}>
                    ASDT → ATDT · gap.descriptor
                  </div>
                  topic: <strong>{gap.topic}</strong> · zpdEstimate: {gap.zpdEstimate}%
                </div>
                <div className="chat-bubble them" style={{ maxWidth: "100%" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginBottom: 3, textTransform: "uppercase" }}>
                    ATDT → ASDT · scaffold.candidates
                  </div>
                  {candidates.length === 0 && <span className="muted">No matching material yet.</span>}
                  {candidates.map((c) => (
                    <div key={c.refId} style={{ fontSize: 12, padding: "3px 0" }}>
                      {c.kind === "video" ? "▶" : "📄"} {c.title} {accepted?.refId === c.refId && "— accepted ✓"}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <AsdtChat student={selected} />
        </>
      )}
    </div>
  );
}
