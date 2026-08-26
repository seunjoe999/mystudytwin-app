import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { courses, documents as seedDocuments, quizBank as seedQuestions, type Course, type CourseDocument, type QuizQuestion } from "../data/mockData";
import { appendProvenance, type ProvenanceEntry, type ProvenanceActor } from "../lib/provenance";
import type { GapDescriptor, ScaffoldCandidate } from "../lib/gaps";

export type Role = "student" | "teacher";
export type Sender = "student" | "teacher" | "atdt" | "asdt";
export type Channel = "direct" | "atdt" | "asdt";

export type SessionKind = "study" | "lecture" | "office-hours" | "due";

export interface PlannerSession {
  id: string;
  day: number; // 0=Mon .. 6=Sun
  time: string;
  title: string;
  courseId: string;
  kind?: SessionKind;
}

export interface ChatMessage {
  id: string;
  studentId: string; // thread key — which student this message is about/with
  sender: Sender;
  text: string;
  time: string;
  channel: Channel;
}

interface AppStateShape {
  currentCourse: Course;
  setCurrentCourseId: (id: string) => void;
  role: Role;
  toggleRole: () => void;
  sessions: PlannerSession[];
  addSession: (s: Omit<PlannerSession, "id">) => void;
  removeSession: (id: string) => void;
  teacherSessions: PlannerSession[];
  addTeacherSession: (s: Omit<PlannerSession, "id">) => void;
  removeTeacherSession: (id: string) => void;
  watchedVideoIds: Set<string>;
  markWatched: (id: string) => void;
  cognitiveOpen: boolean;
  toggleCognitive: () => void;
  closeCognitive: () => void;
  documents: CourseDocument[];
  addDocument: (d: Omit<CourseDocument, "id">) => void;
  questions: QuizQuestion[];
  addQuestion: (q: Omit<QuizQuestion, "id">) => void;
  messages: ChatMessage[];
  sendMessage: (studentId: string, sender: Sender, text: string, channel: Channel) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  provenance: ProvenanceEntry[];
  acceptScaffold: (gap: GapDescriptor, candidate: ScaffoldCandidate) => void;
  logEvent: (actor: ProvenanceActor, action: string, payload?: Record<string, unknown>) => void;
}

const AppContext = createContext<AppStateShape | null>(null);

const SESSIONS_KEY = "mystudytwin.sessions";
const TEACHER_SESSIONS_KEY = "mystudytwin.teacherSessions";
const COURSE_KEY = "mystudytwin.courseId";
const WATCHED_KEY = "mystudytwin.watched";
const DOCS_KEY = "mystudytwin.documents";
const QUESTIONS_KEY = "mystudytwin.questions";
const MESSAGES_KEY = "mystudytwin.messages.v2";
const PROVENANCE_KEY = "mystudytwin.provenance";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return fallback;
}

function loadWatched(): Set<string> {
  try {
    const raw = localStorage.getItem(WATCHED_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set();
}

const defaultSessions: PlannerSession[] = [
  { id: "s1", day: 1, time: "16:00", title: "Recursion Practice", courseId: "csc201" },
  { id: "s2", day: 3, time: "18:00", title: "Trees & BST Review", courseId: "csc201" },
];

const defaultTeacherSessions: PlannerSession[] = [
  { id: "t1", day: 0, time: "10:00", title: "Lecture — CSC 201", courseId: "csc201", kind: "lecture" },
  { id: "t2", day: 2, time: "10:00", title: "Lecture — CSC 201", courseId: "csc201", kind: "lecture" },
  { id: "t3", day: 3, time: "14:00", title: "Office Hours", courseId: "csc201", kind: "office-hours" },
  { id: "t4", day: 4, time: "23:59", title: "Recursion Practice — due", courseId: "csc201", kind: "due" },
];

const defaultMessages: ChatMessage[] = [
  { id: "m1", studentId: "stu1", sender: "teacher", text: "Hi Jane — noticed you're struggling with Recursion. Let me know if you want a walkthrough.", time: "Yesterday, 4:12 PM", channel: "direct" },
  { id: "m2", studentId: "stu1", sender: "student", text: "Yes please! The base case part still confuses me.", time: "Yesterday, 4:20 PM", channel: "direct" },
];

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [courseId, setCourseId] = useState(() => localStorage.getItem(COURSE_KEY) || courses[0].id);
  const [role, setRole] = useState<Role>("student");
  const [sessions, setSessions] = useState<PlannerSession[]>(() => load(SESSIONS_KEY, defaultSessions));
  const [teacherSessions, setTeacherSessions] = useState<PlannerSession[]>(() => load(TEACHER_SESSIONS_KEY, defaultTeacherSessions));
  const [watchedVideoIds, setWatchedVideoIds] = useState<Set<string>>(loadWatched);
  const [cognitiveOpen, setCognitiveOpen] = useState(false);
  const [documents, setDocuments] = useState<CourseDocument[]>(() => load(DOCS_KEY, seedDocuments));
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => load(QUESTIONS_KEY, seedQuestions));
  const [messages, setMessages] = useState<ChatMessage[]>(() => load(MESSAGES_KEY, defaultMessages));
  const [selectedStudentId, setSelectedStudentId] = useState("stu1");
  const [provenance, setProvenance] = useState<ProvenanceEntry[]>(() => load(PROVENANCE_KEY, []));
  const provenanceQueue = useRef<Promise<ProvenanceEntry[]>>(Promise.resolve(provenance));

  useEffect(() => {
    localStorage.setItem(COURSE_KEY, courseId);
  }, [courseId]);
  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);
  useEffect(() => {
    localStorage.setItem(TEACHER_SESSIONS_KEY, JSON.stringify(teacherSessions));
  }, [teacherSessions]);
  useEffect(() => {
    localStorage.setItem(WATCHED_KEY, JSON.stringify(Array.from(watchedVideoIds)));
  }, [watchedVideoIds]);
  useEffect(() => {
    localStorage.setItem(DOCS_KEY, JSON.stringify(documents));
  }, [documents]);
  useEffect(() => {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  }, [questions]);
  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    localStorage.setItem(PROVENANCE_KEY, JSON.stringify(provenance));
  }, [provenance]);

  const currentCourse = courses.find((c) => c.id === courseId) || courses[0];

  // Serialized so concurrent calls can't race on the same prevHash.
  const logEvent = (actor: ProvenanceActor, action: string, payload: Record<string, unknown> = {}) => {
    provenanceQueue.current = provenanceQueue.current.then(async (currentLog) => {
      const next = await appendProvenance(currentLog, actor, action, payload);
      setProvenance(next);
      return next;
    });
  };

  const addSession = (s: Omit<PlannerSession, "id">) => setSessions((prev) => [...prev, { ...s, id: `s${Date.now()}` }]);
  const removeSession = (id: string) => setSessions((prev) => prev.filter((s) => s.id !== id));
  const addTeacherSession = (s: Omit<PlannerSession, "id">) => setTeacherSessions((prev) => [...prev, { ...s, id: `t${Date.now()}` }]);
  const removeTeacherSession = (id: string) => setTeacherSessions((prev) => prev.filter((s) => s.id !== id));
  const markWatched = (id: string) => setWatchedVideoIds((prev) => new Set(prev).add(id));

  const addDocument = (d: Omit<CourseDocument, "id">) => {
    setDocuments((prev) => [{ ...d, id: `d${Date.now()}` }, ...prev]);
    logEvent("teacher", "document.ingested", { title: d.title, topic: d.topic, hasContent: !!d.content });
  };

  const addQuestion = (q: Omit<QuizQuestion, "id">) => {
    setQuestions((prev) => [...prev, { ...q, id: `q${Date.now()}` }]);
    logEvent("teacher", "examination.question_published", { topic: q.topic });
  };

  const sendMessage = (studentId: string, sender: Sender, text: string, channel: Channel) => {
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}${Math.random().toString(36).slice(2, 6)}`, studentId, sender, text, channel, time: new Date().toLocaleString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    logEvent(sender, `${channel}.message`, { studentId, length: text.length });
  };

  const acceptScaffold = (gap: GapDescriptor, candidate: ScaffoldCandidate) => {
    const now = new Date();
    const day = (now.getDay() + 6) % 7; // convert Sun=0 to Mon=0 index
    addSession({
      day,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      title: `Scaffold: ${candidate.title}`,
      courseId: currentCourse.id,
      kind: "study",
    });
    logEvent("student", "tutoring.scaffold_accept", { gapId: gap.id, topic: gap.topic, candidate: candidate.title });
  };

  return (
    <AppContext.Provider
      value={{
        currentCourse,
        setCurrentCourseId: setCourseId,
        role,
        toggleRole: () => setRole((r) => (r === "student" ? "teacher" : "student")),
        sessions,
        addSession,
        removeSession,
        teacherSessions,
        addTeacherSession,
        removeTeacherSession,
        watchedVideoIds,
        markWatched,
        cognitiveOpen,
        toggleCognitive: () => setCognitiveOpen((v) => !v),
        closeCognitive: () => setCognitiveOpen(false),
        documents,
        addDocument,
        questions,
        addQuestion,
        messages,
        sendMessage,
        selectedStudentId,
        setSelectedStudentId,
        provenance,
        acceptScaffold,
        logEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
