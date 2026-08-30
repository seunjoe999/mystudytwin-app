import { NavLink } from "react-router-dom";
import { Video, Users, Timer, BookOpen, BarChart3, Calendar, GraduationCap, Brain, MessageCircle, ShieldCheck, LogOut } from "lucide-react";
import { courses, teacher, student } from "../data/mockData";
import { useAppState } from "../state/AppState";

const studentModes = [
  { path: "/", icon: Video, title: "Self-Tutoring", desc: "Interactive video learning" },
  { path: "/classroom", icon: Users, title: "Classroom Mode", desc: "Passive recording" },
  { path: "/exam", icon: Timer, title: "Exam Mode", desc: "Timed practice" },
];

const teacherModes = [
  { path: "/", icon: Video, title: "Overview", desc: "Course & teaching twin" },
  { path: "/classroom", icon: Users, title: "Classroom Mode", desc: "Record a lecture" },
  { path: "/exam", icon: Timer, title: "Exam Mode", desc: "Manage assessments" },
];

const navItems = [
  { path: "/library", icon: BookOpen, title: "Library" },
  { path: "/analytics", icon: BarChart3, title: "Analytics" },
  { path: "/planner", icon: Calendar, title: "Planner" },
  { path: "/messages", icon: MessageCircle, title: "Messages" },
  { path: "/audit", icon: ShieldCheck, title: "Audit Log" },
];

export function Sidebar() {
  const { currentCourse, setCurrentCourseId, role, toggleRole, toggleCognitive, logout } = useAppState();
  const isTeacher = role === "teacher";
  const modes = isTeacher ? teacherModes : studentModes;
  const person = isTeacher ? teacher : student;

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">MT</div>
        <div>
          <div className="sidebar-title">MyStudyTwin</div>
          <div className="sidebar-subtitle">Powered by AlloyBraid</div>
        </div>
      </div>

      <div className="sidebar-section">
        <label className="sidebar-label" htmlFor="course-select">
          Active Course
        </label>
        <select
          id="course-select"
          className="course-select"
          value={currentCourse.id}
          onChange={(e) => setCurrentCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">{isTeacher ? "Teaching Mode" : "Learning Mode"}</span>
        <div className="mode-list">
          {modes.map((m) => (
            <NavLink
              key={m.path}
              to={m.path}
              end={m.path === "/"}
              className={({ isActive }) => `mode-item${isActive ? " active" : ""}`}
            >
              <m.icon size={18} className="icon" />
              <div>
                <div className="mode-title">{m.title}</div>
                <div className="mode-desc">{m.desc}</div>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="sidebar-nav-body">
        {navItems.map((n) => (
          <NavLink key={n.path} to={n.path} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
            <n.icon size={16} />
            <span>{n.title}</span>
          </NavLink>
        ))}
      </div>

      <button className="cognitive-btn" onClick={toggleCognitive}>
        <Brain size={16} />
        {isTeacher ? "Teaching Twin & Roster" : "Your Cognitive Profile"}
      </button>

      <button className="teacher-toggle" onClick={toggleRole} title="Quick-switch role on this device (for solo demoing)">
        <GraduationCap size={14} />
        {isTeacher ? "Preview as Student (this device)" : "Preview as Teacher (this device)"}
      </button>

      <div className="sidebar-footer">
        <div className="avatar">{person.initials}</div>
        <div style={{ flex: 1 }}>
          <div className="footer-name">{person.name}</div>
          <div className="footer-role">{person.role}</div>
        </div>
        <button
          onClick={logout}
          title="Log out"
          style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.7, display: "flex", padding: 4 }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
