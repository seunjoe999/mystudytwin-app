import { useState } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import type { StudentRecord } from "../data/mockData";
import { useAppState } from "../state/AppState";
import { generateAsdtReply, buildAsdtSystemPrompt } from "../lib/asdt";
import { askAI } from "../lib/ai";
import { OllamaStatus } from "./OllamaStatus";

export function AsdtChat({ student }: { student: StudentRecord }) {
  const { messages, sendMessage } = useAppState();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const thread = messages.filter((m) => m.studentId === student.id && m.channel === "asdt");

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    sendMessage(student.id, "teacher", text, "asdt");
    setInput("");
    setThinking(true);

    const systemPrompt = buildAsdtSystemPrompt(student);
    const aiReply = await askAI(systemPrompt, text);
    const reply = aiReply ?? generateAsdtReply(text, student);
    sendMessage(student.id, "asdt", reply, "asdt");
    setThinking(false);
  };

  return (
    <div className="card card-pad">
      <div className="h2">
        <Bot size={16} color="var(--navy)" /> Ask {student.name}'s ASDT
      </div>
      <p className="muted" style={{ marginBottom: 10 }}>
        {student.name}'s Adaptive Student Digital Twin — ask about their performance, gaps, or engagement.
      </p>
      <OllamaStatus />
      <div className="chat-window">
        {thread.length === 0 && (
          <div className="chat-bubble them">
            I'm {student.name}'s ASDT. Ask me what they're struggling with, how engaged they've been, or their overall mastery.
          </div>
        )}
        {thread.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.sender === "teacher" ? "me" : "them"}`}>
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
          placeholder={`Ask about ${student.name}'s performance...`}
        />
        <button className="btn btn-primary" onClick={send} disabled={thinking}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
