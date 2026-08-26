import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useAppState, type PlannerSession, type SessionKind } from "../state/AppState";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const kindColor: Record<SessionKind, string> = {
  study: "var(--coral)",
  lecture: "var(--navy)",
  "office-hours": "var(--cyan)",
  due: "var(--red)",
};

function WeekGrid({ sessions, onRemove }: { sessions: PlannerSession[]; onRemove: (id: string) => void }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ display: "flex" }}>
        {days.map((d, i) => (
          <div className="day-col" key={d}>
            <div className="day-head">{d}</div>
            {sessions
              .filter((s) => s.day === i)
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((s) => (
                <div key={s.id} className="session-chip" style={{ borderLeftColor: kindColor[s.kind ?? "study"] }}>
                  <button onClick={() => onRemove(s.id)} aria-label="Remove">
                    <X size={11} />
                  </button>
                  <div style={{ fontWeight: 700 }}>{s.time}</div>
                  <div>{s.title}</div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentPlanner() {
  const { sessions, addSession, removeSession, currentCourse } = useAppState();
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("17:00");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addSession({ title: title.trim(), day, time, courseId: currentCourse.id, kind: "study" });
    setTitle("");
  };

  return (
    <div className="page-scroll stack">
      <div>
        <h1 className="h1">Planner</h1>
        <p className="muted">Schedule study sessions for {currentCourse.title}.</p>
      </div>

      <form className="card card-pad" onSubmit={submit} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 160 }}>
          <label className="muted" style={{ display: "block", marginBottom: 4 }}>
            Session title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Recursion practice"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
          />
        </div>
        <div>
          <label className="muted" style={{ display: "block", marginBottom: 4 }}>
            Day
          </label>
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
            {days.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="muted" style={{ display: "block", marginBottom: 4 }}>
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={14} /> Add
          </span>
        </button>
      </form>

      <WeekGrid sessions={sessions} onRemove={removeSession} />
    </div>
  );
}

function TeacherPlanner() {
  const { teacherSessions, addTeacherSession, removeTeacherSession, currentCourse } = useAppState();
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(0);
  const [time, setTime] = useState("10:00");
  const [kind, setKind] = useState<SessionKind>("lecture");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTeacherSession({ title: title.trim(), day, time, courseId: currentCourse.id, kind });
    setTitle("");
  };

  return (
    <div className="page-scroll stack">
      <div>
        <h1 className="h1">Planner</h1>
        <p className="muted">Lectures, office hours, and due dates for {currentCourse.title}.</p>
      </div>

      <form className="card card-pad" onSubmit={submit} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 160 }}>
          <label className="muted" style={{ display: "block", marginBottom: 4 }}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Guest lecture on Graphs"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
          />
        </div>
        <div>
          <label className="muted" style={{ display: "block", marginBottom: 4 }}>
            Type
          </label>
          <select value={kind} onChange={(e) => setKind(e.target.value as SessionKind)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
            <option value="lecture">Lecture</option>
            <option value="office-hours">Office Hours</option>
            <option value="due">Assignment Due</option>
          </select>
        </div>
        <div>
          <label className="muted" style={{ display: "block", marginBottom: 4 }}>
            Day
          </label>
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
            {days.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="muted" style={{ display: "block", marginBottom: 4 }}>
            Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={14} /> Add
          </span>
        </button>
      </form>

      <div style={{ display: "flex", gap: 14, fontSize: 12 }} className="muted">
        {(Object.keys(kindColor) as SessionKind[])
          .filter((k) => k !== "study")
          .map((k) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="dot" style={{ width: 8, height: 8, background: kindColor[k] }} />
              {k === "office-hours" ? "Office Hours" : k === "due" ? "Due" : "Lecture"}
            </span>
          ))}
      </div>

      <WeekGrid sessions={teacherSessions} onRemove={removeTeacherSession} />
    </div>
  );
}

export function Planner() {
  const { role } = useAppState();
  return <div className="main-content">{role === "teacher" ? <TeacherPlanner /> : <StudentPlanner />}</div>;
}
