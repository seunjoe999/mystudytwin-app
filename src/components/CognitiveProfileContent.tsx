import { useState } from "react";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, XCircle } from "lucide-react";
import { statusColor, type Topic } from "../data/mockData";
import { useAppState } from "../state/AppState";

export function CognitiveProfileContent({
  topics,
  courseCode,
  ownerName,
  showFocusState = true,
}: {
  topics: Topic[];
  courseCode: string;
  ownerName?: string;
  showFocusState?: boolean;
}) {
  const { questions, logEvent } = useAppState();
  const [assessing, setAssessing] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const overallMastery = Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length);
  const struggling = [...topics].filter((t) => t.status !== "mastered").sort((a, b) => a.mastery - b.mastery);
  const worst = struggling[0];
  const microQuestion = worst ? questions.find((q) => q.topic === worst.topic) : undefined;

  const startAssessment = () => {
    setAssessing(true);
    setSelected(null);
    setResult(null);
  };

  const answerAssessment = (index: number) => {
    if (!microQuestion || result) return;
    setSelected(index);
    const correct = index === microQuestion.correctIndex;
    setResult(correct ? "correct" : "incorrect");
    logEvent("student", "simulation.micro_assessment_completed", {
      topic: worst.topic,
      questionId: microQuestion.id,
      correct,
    });
  };

  const statusIcon = (status: string) => {
    if (status === "mastered") return <CheckCircle size={14} color="#00c853" />;
    if (status === "learning") return <TrendingUp size={14} color="#ffb300" />;
    return <AlertTriangle size={14} color="#ff3d00" />;
  };

  return (
    <div>
      {ownerName && (
        <div className="h2" style={{ marginBottom: 16 }}>
          <Brain size={18} color="#001f5b" />
          {ownerName}'s Cognitive Profile
        </div>
      )}

      <div className="stack" style={{ marginBottom: 16 }}>
        {showFocusState && (
          <div className="card card-pad">
            <div className="row-between" style={{ marginBottom: 6 }}>
              <span className="muted">Focus State</span>
              <span className="pulse-dot" />
            </div>
            <div style={{ fontWeight: 700, color: "var(--navy)" }}>Optimal</div>
          </div>
        )}

        <div className="card card-pad">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="muted">Overall Mastery</span>
            <span style={{ fontWeight: 700, color: "var(--navy)" }}>{overallMastery}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${overallMastery}%`, background: "linear-gradient(90deg,#ff6f61,#00e5ff)" }}
            />
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="h2" style={{ justifyContent: "space-between" }}>
          <span>Knowledge Map</span>
          <span className="muted" style={{ fontWeight: 400 }}>
            {courseCode}
          </span>
        </div>
        {topics.map((t) => (
          <div className="topic-row" key={t.topic}>
            <div className="topic-head">
              <span className="dot" style={{ background: statusColor(t.status) }} />
              <span className="topic-name">{t.topic}</span>
              {statusIcon(t.status)}
            </div>
            <div className="topic-bar-row">
              <div className="progress-track thin" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${t.mastery}%`, background: statusColor(t.status) }} />
              </div>
              <span className="topic-pct">{t.mastery}%</span>
            </div>
            <div className="muted" style={{ marginLeft: 18, fontSize: 11, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Clock size={11} /> {t.lastStudied}
            </div>
          </div>
        ))}
      </div>

      {worst && (
        <div className="card card-pad" style={{ marginBottom: 16, border: "2px solid var(--coral)" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ padding: 8, borderRadius: 8, background: "rgba(255,111,97,0.1)", height: "fit-content" }}>
              <AlertTriangle size={18} color="var(--coral)" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="h2" style={{ marginBottom: 6 }}>
                Predictive Risk Alert
              </div>
              <p className="muted" style={{ marginBottom: 10 }}>
                High probability of struggling with <strong style={{ color: "var(--navy)" }}>"{worst.topic}"</strong> based
                on {ownerName ? `${ownerName}'s` : "the"} current mastery trend.
              </p>

              {!assessing && (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  onClick={startAssessment}
                  disabled={!microQuestion}
                  title={microQuestion ? undefined : `No published question tagged "${worst.topic}" yet`}
                >
                  {microQuestion ? "Run Micro-Assessment" : "No Assessment Available Yet"}
                </button>
              )}

              {assessing && microQuestion && (
                <div style={{ background: "var(--bg)", borderRadius: 10, padding: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 8 }}>{microQuestion.question}</p>
                  {microQuestion.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrectOpt = i === microQuestion.correctIndex;
                    let cls = "option-btn";
                    if (result && isSelected) cls += isCorrectOpt ? " correct" : " incorrect";
                    else if (result && isCorrectOpt) cls += " correct";
                    else if (isSelected) cls += " selected";
                    return (
                      <button key={opt} className={cls} onClick={() => answerAssessment(i)} disabled={!!result}>
                        {opt}
                      </button>
                    );
                  })}
                  {result && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, fontWeight: 700, color: result === "correct" ? "var(--green)" : "var(--red)" }}>
                      {result === "correct" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {result === "correct" ? "Correct — nice work." : `Not quite — correct answer: ${microQuestion.options[microQuestion.correctIndex]}`}
                    </div>
                  )}
                  <button className="btn btn-outline" style={{ width: "100%", marginTop: 10 }} onClick={() => setAssessing(false)}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="h2">Recommended Focus</div>
        {struggling.slice(0, 2).map((t, i) => (
          <div
            key={t.topic}
            className="row-between"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              background: i === 0 ? "rgba(255,61,0,0.05)" : "rgba(255,179,0,0.05)",
              border: `1px solid ${i === 0 ? "rgba(255,61,0,0.2)" : "rgba(255,179,0,0.2)"}`,
              marginBottom: 6,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>
              {statusIcon(t.status)} {t.topic}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? "var(--red)" : "var(--amber)" }}>
              {i === 0 ? "URGENT" : "REVIEW"}
            </span>
          </div>
        ))}
      </div>

      <div
        className="card card-pad"
        style={{ background: "linear-gradient(135deg,#001f5b,#001f5bcc)", color: "#fff", border: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Zap size={14} color="#00e5ff" />
          <span style={{ fontSize: 13, fontWeight: 700 }}>AI Insight</span>
        </div>
        <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
          {ownerName ?? "This student"} learns best through visual examples and hands-on practice. Consider more
          exercises for {worst?.topic ?? "their weakest topic"} to strengthen understanding.
        </p>
      </div>
    </div>
  );
}
