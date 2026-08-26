import { useEffect, useRef, useState } from "react";
import { Mic, Square, FileText, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { recordings as seedRecordings, type Recording } from "../data/mockData";
import { useAppState } from "../state/AppState";

export function ClassroomMode() {
  const { currentCourse, role } = useAppState();
  const isTeacher = role === "teacher";
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>(seedRecordings);
  const [openTranscriptId, setOpenTranscriptId] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [recording]);

  const stop = () => {
    setRecording(false);
    if (seconds > 3) {
      setRecordings((prev) => [
        {
          id: `r${Date.now()}`,
          title: `Live Session — ${currentCourse.code}`,
          date: "Just now",
          durationMin: Math.max(1, Math.round(seconds / 60)),
          summary: "Recording captured and queued for AI transcription. A topic summary will appear here shortly.",
          keyTopics: ["Pending analysis"],
          transcript: ["[00:00] Transcript is still processing — check back in a few minutes."],
        },
        ...prev,
      ]);
    }
    setSeconds(0);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="main-content">
      <div className="page-scroll stack">
        <div>
          <h1 className="h1">Classroom Mode</h1>
          <p className="muted">
            {isTeacher
              ? "Passive recording — capture your lecture, AlloyBraid transcribes and summarizes it automatically for students."
              : "Passive recording — your teacher's lectures appear here automatically, with AI transcripts and topic summaries."}
          </p>
        </div>

        {isTeacher ? (
        <div className="card card-pad" style={{ textAlign: "center", padding: 32 }}>
          {recording ? (
            <>
              <div className="pill" style={{ background: "rgba(255,61,0,0.1)", color: "var(--red)", marginBottom: 14 }}>
                <span className="rec-dot" /> RECORDING
              </div>
              <div className="timer-display" style={{ marginBottom: 18 }}>
                {fmt(seconds)}
              </div>
              <button className="btn" style={{ background: "var(--red)", color: "#fff", padding: "12px 28px" }} onClick={stop}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Square size={16} /> Stop Recording
                </span>
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: "rgba(0,31,91,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
              >
                <Mic size={26} color="var(--navy)" />
              </div>
              <p className="muted" style={{ marginBottom: 16 }}>
                Start a recording for {currentCourse.title}. AlloyBraid will transcribe and summarize automatically.
              </p>
              <button className="btn btn-navy" style={{ padding: "12px 28px" }} onClick={() => setRecording(true)}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Mic size={16} /> Start Recording
                </span>
              </button>
            </>
          )}
        </div>
        ) : (
          <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                background: "rgba(0,31,91,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Mic size={22} color="var(--navy)" />
            </div>
            <p className="muted" style={{ margin: 0 }}>
              {currentCourse.title} recordings appear below automatically whenever your teacher records a lecture.
            </p>
          </div>
        )}

        <div>
          <div className="h2">Past Recordings</div>
          <div className="stack">
            {recordings.map((r) => {
              const open = openTranscriptId === r.id;
              return (
                <div key={r.id} className="card card-pad">
                  <div className="row-between" style={{ marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: 14 }}>{r.title}</div>
                      <div className="muted" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={12} /> {r.date}
                        </span>
                        <span>{r.durationMin} min</span>
                      </div>
                    </div>
                    <FileText size={18} color="var(--text-faint)" />
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, marginBottom: 10 }}>{r.summary}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {r.keyTopics.map((t) => (
                      <span key={t} className="badge" style={{ background: "rgba(0,31,91,0.06)", color: "var(--navy)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: "6px 12px" }}
                    onClick={() => setOpenTranscriptId(open ? null : r.id)}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {open ? "Hide Transcript" : "View Transcript"}
                    </span>
                  </button>
                  {open && (
                    <div style={{ marginTop: 12, background: "var(--bg)", borderRadius: 10, padding: 14, maxHeight: 260, overflowY: "auto" }}>
                      {r.transcript.map((line, i) => (
                        <p key={i} style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.7, margin: 0 }}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
