import { X } from "lucide-react";
import { useAppState } from "../state/AppState";
import { CognitiveProfileContent } from "./CognitiveProfileContent";
import { TeacherCognitiveProfile } from "./TeacherCognitiveProfile";

export function CognitiveDrawer() {
  const { cognitiveOpen, closeCognitive, role, currentCourse } = useAppState();

  return (
    <>
      {cognitiveOpen && <div className="drawer-backdrop" onClick={closeCognitive} />}
      <div className={`drawer${cognitiveOpen ? " open" : ""}`}>
        <div className="drawer-header">
          <span style={{ fontWeight: 700, color: "var(--navy)" }}>Cognitive Profile</span>
          <button className="icon-btn" style={{ color: "var(--navy)" }} onClick={closeCognitive}>
            <X size={18} />
          </button>
        </div>
        <div className="drawer-body">
          {role === "teacher" ? (
            <TeacherCognitiveProfile />
          ) : (
            <CognitiveProfileContent topics={currentCourse.topics} courseCode={currentCourse.code} showFocusState />
          )}
        </div>
      </div>
    </>
  );
}
