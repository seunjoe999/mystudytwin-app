import { useState } from "react";
import { Send, Bot, Loader2 } from "lucide-react";
import { students, teacher, student as studentPerson, documents } from "../data/mockData";
import { useAppState } from "../state/AppState";
import { generateAtdtReply, buildAtdtSystemPrompt } from "../lib/atdt";
import { askAI } from "../lib/ai";
import { SyncStatus } from "../components/SyncStatus";

export function Messages() {
  const { currentCourse, role, messages, sendMessage, selectedStudentId, setSelectedStudentId } = useAppState();
  const [input, setInput] = useState("");
  const [studentTab, setStudentTab] = useState<"teacher" | "atdt">("teacher");
  const [thinking, setThinking] = useState(false);

  const roster = students.filter((s) => s.courseId === currentCourse.id);
  const courseDocs = documents.filter((d) => d.courseId === currentCourse.id);

  if (role === "student") {
    const channel = studentTab === "teacher" ? "direct" : "atdt";
    const thread = messages.filter((m) => m.studentId === studentPerson.id && m.channel === channel);
    const otherName = studentTab === "teacher" ? teacher.name : "ATDT";

    const send = async () => {
      const text = input.trim();
      if (!text || thinking) return;
      setInput("");
      if (studentTab === "teacher") {
        sendMessage(studentPerson.id, "student", text, "direct");
      } else {
        sendMessage(studentPerson.id, "student", text, "atdt");
        setThinking(true);
        const systemPrompt = buildAtdtSystemPrompt(currentCourse.title, courseDocs, currentCourse.topics, text);
        const aiReply = await askAI(systemPrompt, text);
        const reply = aiReply ?? generateAtdtReply(text, courseDocs, currentCourse.topics);
        sendMessage(studentPerson.id, "atdt", reply, "atdt");
        setThinking(false);
      }
    };

    return (
      <div className="main-content">
        <div className="page-scroll stack">
          <div className="row-between">
            <div>
              <h1 className="h1">Messages</h1>
              <p className="muted">Talk to {teacher.name} directly, or ask ATDT — their always-on teaching twin.</p>
            </div>
            <SyncStatus />
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            <div className="card card-pad" style={{ width: 220, flexShrink: 0 }}>
              <div className="h2">Contacts</div>
              <div className="thread-list">
                <div className={`thread-item${studentTab === "teacher" ? " active" : ""}`} onClick={() => setStudentTab("teacher")}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                    {teacher.initials}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{teacher.name}</span>
                </div>
                <div className={`thread-item${studentTab === "atdt" ? " active" : ""}`} onClick={() => setStudentTab("atdt")}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                    <Bot size={14} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>ATDT</span>
                </div>
              </div>
            </div>

            <div className="card card-pad" style={{ flex: 1 }}>
              <div className="h2">Chat with {otherName}</div>
              {studentTab === "atdt" && (
                <p className="muted" style={{ marginTop: -6, marginBottom: 10 }}>
                  {teacher.name}'s digital twin, teaching from their actual lectures — available whenever they're not.
                </p>
              )}
              <div className="chat-window" style={{ maxHeight: 420 }}>
                {thread.length === 0 && <p className="muted">No messages yet — say hello.</p>}
                {thread.map((m) => (
                  <div key={m.id}>
                    <div className={`chat-bubble ${m.sender === "student" ? "me" : "them"}`}>{m.text}</div>
                    <div className="chat-time" style={{ textAlign: m.sender === "student" ? "right" : "left" }}>
                      {m.time}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="chat-bubble them">
                    <Loader2 size={13} className="spin" />
                  </div>
                )}
              </div>
              <div className="chat-input-row">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={`Message ${otherName}...`}
                />
                <button className="btn btn-primary" onClick={send} disabled={thinking}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teacher: direct messages with a chosen student
  const threadId = selectedStudentId;
  const thread = messages.filter((m) => m.studentId === threadId && m.channel === "direct");
  const otherName = roster.find((s) => s.id === threadId)?.name ?? "Student";

  const send = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(threadId, "teacher", text, "direct");
    setInput("");
  };

  return (
    <div className="main-content">
      <div className="page-scroll stack">
        <div className="row-between">
          <div>
            <h1 className="h1">Messages</h1>
            <p className="muted">Message any student in {currentCourse.title} directly.</p>
          </div>
          <SyncStatus />
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div className="card card-pad" style={{ width: 220, flexShrink: 0 }}>
            <div className="h2">Roster</div>
            <div className="thread-list">
              {roster.map((s) => (
                <div
                  key={s.id}
                  className={`thread-item${selectedStudentId === s.id ? " active" : ""}`}
                  onClick={() => setSelectedStudentId(s.id)}
                >
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                    {s.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>{s.name}</span>
                </div>
              ))}
            </div>
            <p className="muted" style={{ marginTop: 10, fontSize: 11 }}>
              To ask about a student's performance instead of messaging them, open <strong>Teaching Twin &amp; Roster</strong> and use Ask ASDT.
            </p>
          </div>

          <div className="card card-pad" style={{ flex: 1 }}>
            <div className="h2">Chat with {otherName}</div>
            <div className="chat-window" style={{ maxHeight: 420 }}>
              {thread.length === 0 && <p className="muted">No messages yet — say hello.</p>}
              {thread.map((m) => (
                <div key={m.id}>
                  <div className={`chat-bubble ${m.sender === "teacher" ? "me" : "them"}`}>{m.text}</div>
                  <div className="chat-time" style={{ textAlign: m.sender === "teacher" ? "right" : "left" }}>
                    {m.time}
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={`Message ${otherName}...`}
              />
              <button className="btn btn-primary" onClick={send}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
