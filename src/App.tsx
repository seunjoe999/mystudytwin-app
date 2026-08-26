import { HashRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { CognitiveProfile } from "./components/CognitiveProfile";
import { CognitiveDrawer } from "./components/CognitiveDrawer";
import { SelfTutoring } from "./pages/SelfTutoring";
import { ClassroomMode } from "./pages/ClassroomMode";
import { ExamMode } from "./pages/ExamMode";
import { Library } from "./pages/Library";
import { Analytics } from "./pages/Analytics";
import { Planner } from "./pages/Planner";
import { Messages } from "./pages/Messages";
import { AppStateProvider, useAppState } from "./state/AppState";

function Shell() {
  const { role } = useAppState();
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SelfTutoring />
                {role === "student" && <CognitiveProfile />}
              </>
            }
          />
          <Route path="/classroom" element={<ClassroomMode />} />
          <Route path="/exam" element={<ExamMode />} />
          <Route path="/library" element={<Library />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </div>
      <CognitiveDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppStateProvider>
  );
}
