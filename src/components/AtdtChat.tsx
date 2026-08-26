import { useState } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import { documents, teacher, student } from "../data/mockData";
import { useAppState } from "../state/AppState";
import { generateAtdtReply, buildAtdtSystemPrompt } from "../lib/atdt";
import { askAI } from "../lib/ai";
import { OllamaStatus } from "./OllamaStatus";

export function AtdtChat() {
  const { currentCourse, messages, sendMessage } = useAppState();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const courseDocs = documents.filter((d) => d.courseId === currentCourse.id);
  const thread = messages.filter((m) => m.studentId === student.id && m.channel === "atdt");

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    sendMessage(student.id, "student", text, "atdt");
    setInput("");
    setThinking(true);

    const systemPrompt = buildAtdtSystemPrompt(currentCourse.title, courseDocs, currentCourse.topics, text);
    const aiReply = await askAI(systemPrompt, text);
    const reply = aiReply ?? generateAtdtReply(text, courseDocs, currentCourse.topics);
    sendMessage(student.id, "atdt", reply, "atdt");
    setThinking(false);
  };

  return (
    <div className="card card-pad">
      <div className="h2">
        <Bot size={16} color="var(--navy)" /> Ask ATDT
      </div>
      <p className="muted" style={{ marginBottom: 10 }}>
        {teacher.name}'s digital twin — get tutoring from what they've actually taught, any time.
      </p>
      <OllamaStatus />
      <div className="chat-window">
        {thread.length === 0 && (
          <div className="chat-bubble them">
            Hi! I'm ATDT — trained on everything {teacher.name} has uploaded for this course. Ask me about any topic.
          </div>
        )}
        {thread.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.sender === "student" ? "me" : "them"}`}>
            {m.text}
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
          placeholder='Try "explain recursion" or "what did the teacher upload on trees?"'
        />
        <button className="btn btn-primary" onClick={send} disabled={thinking}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
