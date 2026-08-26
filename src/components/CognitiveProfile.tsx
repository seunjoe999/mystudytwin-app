import { Brain } from "lucide-react";
import { useAppState } from "../state/AppState";
import { CognitiveProfileContent } from "./CognitiveProfileContent";

export function CognitiveProfile() {
  const { currentCourse } = useAppState();
  return (
    <aside className="cognitive-panel">
      <div className="h2">
        <Brain size={18} color="#001f5b" />
        Your Cognitive Profile
      </div>
      <CognitiveProfileContent topics={currentCourse.topics} courseCode={currentCourse.code} showFocusState />
    </aside>
  );
}
