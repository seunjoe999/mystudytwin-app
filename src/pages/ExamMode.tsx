import { useEffect, useState } from "react";
import { Timer, CheckCircle, XCircle, RotateCcw, Plus } from "lucide-react";
import { useAppState } from "../state/AppState";

const QUIZ_SECONDS = 90;

function TeacherExamManager() {
  const { questions, addQuestion, currentCourse } = useAppState();
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState(currentCourse.topics[0]?.topic ?? "");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some((o) => !o.trim())) return;
    addQuestion({ topic, question: question.trim(), options: options.map((o) => o.trim()), correctIndex });
    setQuestion("");
    setOptions(["", "", "", ""]);
  };

  return (
    <div className="main-content">
      <div className="page-scroll stack">
        <div>
          <h1 className="h1">Exam Mode</h1>
          <p className="muted">Manage the assessment question bank for {currentCourse.title}.</p>
        </div>

        <form className="card card-pad stack" onSubmit={submit}>
          <div className="h2">
            <Plus size={16} /> Add a question
          </div>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
            {currentCourse.topics.map((t) => (
              <option key={t.topic} value={t.topic}>
                {t.topic}
              </option>
            ))}
          </select>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question text"
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
          />
          {options.map((opt, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="radio"
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                title="Mark as correct answer"
              />
              <input
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                placeholder={`Option ${i + 1}`}
                style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
              />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" style={{ alignSelf: "flex-start" }}>
            Publish Question
          </button>
        </form>

        <div className="card card-pad">
          <div className="h2">Published question bank ({questions.length})</div>
          <div className="stack">
            {questions.map((q) => (
              <div key={q.id} style={{ padding: "10px 0", borderTop: "1px solid var(--border)" }}>
                <span className="badge" style={{ background: "rgba(0,31,91,0.06)", color: "var(--navy)", marginBottom: 6, display: "inline-block" }}>
                  {q.topic}
                </span>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", margin: "4px 0" }}>{q.question}</p>
                <p className="muted">Correct: {q.options[q.correctIndex]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExamMode() {
  const { role, questions } = useAppState();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_SECONDS);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) {
      finish();
      return;
    }
    const t = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, finished, timeLeft]);

  if (role === "teacher") {
    return <TeacherExamManager />;
  }

  const start = () => {
    setStarted(true);
    setFinished(false);
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setTimeLeft(QUIZ_SECONDS);
  };

  const finish = () => {
    setFinished(true);
  };

  const next = () => {
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);
    if (index + 1 >= questions.length) {
      finish();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;

  if (!started) {
    return (
      <div className="main-content">
        <div className="page-scroll stack">
          <div>
            <h1 className="h1">Exam Mode</h1>
            <p className="muted">Timed practice — {questions.length} questions, {QUIZ_SECONDS}s on the clock.</p>
          </div>
          <div className="card card-pad" style={{ textAlign: "center", padding: 36 }}>
            <Timer size={40} color="var(--navy)" style={{ marginBottom: 12 }} />
            <h2 className="h2" style={{ justifyContent: "center" }}>
              Ready for a timed practice set?
            </h2>
            <p className="muted" style={{ marginBottom: 18 }}>
              Includes any new questions your teacher has published.
            </p>
            <button className="btn btn-primary" style={{ padding: "12px 28px" }} onClick={start}>
              Start Practice Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="main-content">
        <div className="page-scroll stack">
          <div className="card card-pad" style={{ textAlign: "center", padding: 36 }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: "var(--navy)", marginBottom: 4 }}>{pct}%</div>
            <p className="muted" style={{ marginBottom: 18 }}>
              You scored {score} out of {questions.length}
            </p>
            <button className="btn btn-navy" style={{ padding: "10px 22px" }} onClick={start}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <RotateCcw size={15} /> Try Again
              </span>
            </button>
          </div>

          <div className="stack">
            {questions.map((q, i) => {
              const given = answers[i];
              const correct = given === q.correctIndex;
              return (
                <div key={q.id} className="card card-pad">
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    {correct ? <CheckCircle size={18} color="var(--green)" /> : <XCircle size={18} color="var(--red)" />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: "var(--navy)", marginBottom: 6 }}>{q.question}</p>
                      <p className="muted">
                        Your answer: {given !== null && given !== undefined ? q.options[given] : "No answer"}
                        {!correct && <> · Correct: {q.options[q.correctIndex]}</>}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[index];

  return (
    <div className="main-content">
      <div className="page-scroll stack">
        <div className="row-between">
          <span className="muted">
            Question {index + 1} of {questions.length}
          </span>
          <span className="pill" style={{ background: timeLeft <= 15 ? "rgba(255,61,0,0.1)" : "rgba(0,31,91,0.06)", color: timeLeft <= 15 ? "var(--red)" : "var(--navy)" }}>
            <Timer size={12} /> {timeLeft}s
          </span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((index + 1) / questions.length) * 100}%`, background: "var(--coral)" }} />
        </div>

        <div className="card card-pad">
          <span className="badge" style={{ background: "rgba(0,31,91,0.06)", color: "var(--navy)", marginBottom: 10, display: "inline-block" }}>
            {q.topic}
          </span>
          <h2 className="h2" style={{ marginTop: 8 }}>
            {q.question}
          </h2>
          {q.options.map((opt, i) => (
            <button
              key={opt}
              className={`option-btn${selected === i ? " selected" : ""}`}
              onClick={() => setSelected(i)}
            >
              {opt}
            </button>
          ))}
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 4 }} disabled={selected === null} onClick={next}>
            {index + 1 === questions.length ? "Finish" : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
