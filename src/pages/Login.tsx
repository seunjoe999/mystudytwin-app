import { GraduationCap, Bot } from "lucide-react";
import { useAppState } from "../state/AppState";
import { teacher, student } from "../data/mockData";

export function Login() {
  const { login } = useAppState();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--navy, #0f1c3f) 0%, #1a2b5c 100%)",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#fff",
              color: "var(--navy, #0f1c3f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 20,
              margin: "0 auto 14px",
            }}
          >
            MT
          </div>
          <h1 style={{ color: "#fff", fontSize: 24, marginBottom: 4 }}>MyStudyTwin</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
            Sign in to your demo account to continue. Your role is saved on this device only —
            log in as the other role on a different device or browser to see them talk in real time.
          </p>
        </div>

        <div className="card card-pad" style={{ background: "#fff", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            className="btn btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-start", padding: "14px 16px" }}
            onClick={() => login("student")}
          >
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
              {student.initials}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600 }}>Continue as Student</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{student.name} (demo account)</div>
            </div>
          </button>

          <button
            className="btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "flex-start",
              padding: "14px 16px",
              border: "1px solid var(--border, #d8dce6)",
              background: "#f7f8fb",
            }}
            onClick={() => login("teacher")}
          >
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
              {teacher.initials}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 600, color: "var(--navy, #0f1c3f)" }}>Continue as Teacher</div>
              <div style={{ fontSize: 12, opacity: 0.7, color: "var(--navy, #0f1c3f)" }}>{teacher.name} (demo account)</div>
            </div>
            <GraduationCap size={16} style={{ marginLeft: "auto", color: "var(--navy, #0f1c3f)" }} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7a8296", marginTop: 4 }}>
            <Bot size={13} />
            ATDT and ASDT reply with live AI and sync instantly across every device that's logged in.
          </div>
        </div>
      </div>
    </div>
  );
}
