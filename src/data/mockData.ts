export type MasteryStatus = "mastered" | "learning" | "struggling";

export interface Topic {
  topic: string;
  mastery: number;
  status: MasteryStatus;
  lastStudied: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  topics: Topic[];
}

export interface VideoItem {
  id: string;
  title: string;
  courseId: string;
  module: string;
  duration: string;
  durationSeconds: number;
  aiPick?: boolean;
  description: string;
  tags: string[];
  thumbnailGradient: string;
}

export const courses: Course[] = [
  {
    id: "csc201",
    title: "CSC 201: Data Structures",
    code: "CSC 201",
    topics: [
      { topic: "Arrays", mastery: 92, status: "mastered", lastStudied: "2 days ago" },
      { topic: "Linked Lists", mastery: 75, status: "learning", lastStudied: "Today" },
      { topic: "Stacks & Queues", mastery: 68, status: "learning", lastStudied: "Yesterday" },
      { topic: "Recursion", mastery: 45, status: "struggling", lastStudied: "3 days ago" },
      { topic: "Trees", mastery: 25, status: "struggling", lastStudied: "5 days ago" },
      { topic: "Hash Tables", mastery: 58, status: "learning", lastStudied: "4 days ago" },
    ],
  },
  {
    id: "mth210",
    title: "MTH 210: Calculus II",
    code: "MTH 210",
    topics: [
      { topic: "Integration Techniques", mastery: 81, status: "mastered", lastStudied: "1 day ago" },
      { topic: "Series & Sequences", mastery: 63, status: "learning", lastStudied: "2 days ago" },
      { topic: "Parametric Equations", mastery: 40, status: "struggling", lastStudied: "6 days ago" },
      { topic: "Polar Coordinates", mastery: 55, status: "learning", lastStudied: "3 days ago" },
    ],
  },
];

export const videos: VideoItem[] = [
  {
    id: "v1",
    title: "Introduction to Linked Lists",
    courseId: "csc201",
    module: "Module 3",
    duration: "5:00",
    durationSeconds: 300,
    description:
      "Learn the fundamentals of linked lists, including node structure, insertion, deletion, and traversal operations. This video covers singly linked lists and compares them with arrays to help you understand when to use each data structure.",
    tags: ["Beginner Friendly", "3 Socratic Checkpoints", "5 min average completion"],
    thumbnailGradient: "linear-gradient(135deg,#12213f,#0a1730)",
  },
  {
    id: "v2",
    title: "Doubly Linked Lists Deep Dive",
    courseId: "csc201",
    module: "Module 3",
    duration: "12:45",
    durationSeconds: 765,
    description: "Building on your linked list knowledge — bidirectional traversal, insertion, and deletion patterns.",
    tags: ["Intermediate", "4 Socratic Checkpoints"],
    thumbnailGradient: "linear-gradient(135deg,#1a2a52,#0a1730)",
  },
  {
    id: "v3",
    title: "Recursion Fundamentals",
    courseId: "csc201",
    module: "Module 5",
    duration: "15:20",
    durationSeconds: 920,
    aiPick: true,
    description: "AI detected this as a struggle area. Base cases, recursive cases, call stacks, and common pitfalls.",
    tags: ["AI Pick", "Struggle Area", "6 Socratic Checkpoints"],
    thumbnailGradient: "linear-gradient(135deg,#241238,#150a2e)",
  },
  {
    id: "v4",
    title: "Trees & BST Introduction",
    courseId: "csc201",
    module: "Module 6",
    duration: "18:10",
    durationSeconds: 1090,
    description: "Prerequisite for the upcoming exam. Binary trees, binary search trees, and traversal orders.",
    tags: ["Prerequisite", "Upcoming Exam"],
    thumbnailGradient: "linear-gradient(135deg,#0f2e2a,#08201c)",
  },
  {
    id: "v5",
    title: "Stacks & Queues in Practice",
    courseId: "csc201",
    module: "Module 4",
    duration: "10:05",
    durationSeconds: 605,
    description: "Real-world use cases for LIFO and FIFO structures, with implementation walkthroughs.",
    tags: ["Beginner Friendly"],
    thumbnailGradient: "linear-gradient(135deg,#2e1f0f,#201408)",
  },
  {
    id: "v6",
    title: "Hash Tables Explained",
    courseId: "csc201",
    module: "Module 7",
    duration: "13:30",
    durationSeconds: 810,
    description: "Hashing functions, collision resolution, and average-case complexity analysis.",
    tags: ["Intermediate"],
    thumbnailGradient: "linear-gradient(135deg,#122e2e,#0a1f1f)",
  },
];

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const quizBank: QuizQuestion[] = [
  {
    id: "q1",
    topic: "Linked Lists",
    question: "What is the time complexity of inserting a node at the head of a singly linked list?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
    correctIndex: 0,
  },
  {
    id: "q2",
    topic: "Recursion",
    question: "What must every correct recursive function have to avoid infinite recursion?",
    options: ["A loop", "A base case", "A pointer", "A hash map"],
    correctIndex: 1,
  },
  {
    id: "q3",
    topic: "Stacks & Queues",
    question: "Which data structure follows First-In-First-Out (FIFO) ordering?",
    options: ["Stack", "Queue", "Tree", "Graph"],
    correctIndex: 1,
  },
  {
    id: "q4",
    topic: "Trees",
    question: "In a binary search tree, where are values smaller than the root stored?",
    options: ["Right subtree", "Left subtree", "Root itself", "Anywhere"],
    correctIndex: 1,
  },
  {
    id: "q5",
    topic: "Arrays",
    question: "What is the time complexity of accessing an element by index in an array?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
    correctIndex: 2,
  },
  {
    id: "q6",
    topic: "Hash Tables",
    question: "What technique resolves collisions by storing multiple entries in a linked list at the same index?",
    options: ["Open addressing", "Chaining", "Probing", "Rehashing"],
    correctIndex: 1,
  },
];

export interface Recording {
  id: string;
  title: string;
  date: string;
  durationMin: number;
  summary: string;
  keyTopics: string[];
  transcript: string[];
}

export const recordings: Recording[] = [
  {
    id: "r1",
    title: "Lecture 8 — Balanced Trees",
    date: "Yesterday, 10:00 AM",
    durationMin: 52,
    summary:
      "Covered AVL tree rotations, balance factors, and why unbalanced BSTs degrade to O(n) lookups. Ended with a worked example of a left-right rotation.",
    keyTopics: ["AVL Trees", "Rotations", "Balance Factor"],
    transcript: [
      "[00:00] Dr. Ade Bello: Good morning everyone. Today we're finishing off trees with balanced trees — specifically AVL trees.",
      "[00:47] Dr. Ade Bello: Quick recap — a plain BST degrades to O(n) lookups if it becomes a straight line, like inserting sorted data.",
      "[03:12] Dr. Ade Bello: The balance factor is height(left) minus height(right). AVL keeps this in {-1, 0, 1} at every node.",
      "[11:05] Student: What happens the moment it goes out of range?",
      "[11:20] Dr. Ade Bello: Great question — that's exactly when we rotate. Let's do a left-right rotation on the board.",
      "[24:40] Dr. Ade Bello: Notice the rotation only touches three pointers — it's O(1), the expensive part is finding where to rotate.",
      "[38:15] Dr. Ade Bello: For your assignment, trace the balance factors after each insertion of [5, 3, 8, 1, 4, 7, 9, 2].",
      "[51:02] Dr. Ade Bello: That's it for today — Recursion Practice Problems are due Thursday, and the Trees & BST slides are on the Library.",
    ],
  },
  {
    id: "r2",
    title: "Lecture 7 — Recursion & Backtracking",
    date: "3 days ago, 10:00 AM",
    durationMin: 48,
    summary:
      "Introduced backtracking as an extension of recursion, with the N-Queens problem as the running example. Several students asked about stack overflow risk.",
    keyTopics: ["Recursion", "Backtracking", "N-Queens"],
    transcript: [
      "[00:00] Dr. Ade Bello: Last time we covered plain recursion — base case, recursive case. Today, backtracking.",
      "[05:30] Dr. Ade Bello: Backtracking is recursion plus 'undo' — you try a choice, recurse, and if it fails, you undo and try the next.",
      "[14:02] Dr. Ade Bello: N-Queens is the classic example — place a queen per row, backtrack when two queens attack each other.",
      "[22:18] Student: Can this ever cause a stack overflow?",
      "[22:30] Dr. Ade Bello: Yes — if your recursion depth exceeds the call stack limit. For N-Queens with N under 20 you're fine.",
      "[35:40] Dr. Ade Bello: Try coding N-Queens for N=4 by hand before next class — it only has two solutions, good for checking your logic.",
      "[47:00] Dr. Ade Bello: Recursion Cheat Sheet is uploaded — it has the base-case patterns we covered today.",
    ],
  },
  {
    id: "r3",
    title: "Lecture 6 — Hash Table Internals",
    date: "1 week ago, 10:00 AM",
    durationMin: 55,
    summary: "Deep dive into hash functions, load factor, and amortized O(1) analysis for dynamic resizing.",
    keyTopics: ["Hashing", "Load Factor", "Amortized Analysis"],
    transcript: [
      "[00:00] Dr. Ade Bello: Hash tables — how do we get average O(1) lookup from an array?",
      "[06:15] Dr. Ade Bello: A good hash function distributes keys uniformly. Collisions are inevitable — how do we resolve them?",
      "[18:40] Dr. Ade Bello: Chaining stores a linked list per bucket. Open addressing probes for the next free slot instead.",
      "[29:05] Dr. Ade Bello: Load factor is n/m — number of entries over bucket count. Past about 0.7, performance degrades.",
      "[41:20] Dr. Ade Bello: Resizing is amortized O(1) — expensive occasionally, cheap on average across many inserts.",
      "[53:00] Dr. Ade Bello: Hash Tables Reading is on the Library — it has the full derivation of the amortized bound.",
    ],
  },
];

export const weeklyMastery = [58, 60, 61, 63, 65, 67, 68];
export const weeklyStudyMinutes = [20, 45, 30, 60, 15, 50, 40];

export function statusColor(status: MasteryStatus) {
  switch (status) {
    case "mastered":
      return "#00c853";
    case "learning":
      return "#ffb300";
    case "struggling":
      return "#ff3d00";
  }
}

// ---------- People ----------

export const teacher = { id: "teacher1", name: "Dr. Ade Bello", role: "Teacher", initials: "AB" };
export const student = { id: "stu1", name: "Jane Doe", role: "Student", initials: "JD" };

export interface StudentRecord {
  id: string;
  name: string;
  courseId: string;
  topics: Topic[];
  lastActive: string;
}

export const students: StudentRecord[] = [
  { id: "stu1", name: "Jane Doe", courseId: "csc201", topics: courses[0].topics, lastActive: "Just now" },
  {
    id: "stu2",
    name: "Chinedu Okafor",
    courseId: "csc201",
    lastActive: "2 hours ago",
    topics: [
      { topic: "Arrays", mastery: 88, status: "mastered", lastStudied: "1 day ago" },
      { topic: "Linked Lists", mastery: 52, status: "learning", lastStudied: "2 days ago" },
      { topic: "Stacks & Queues", mastery: 40, status: "struggling", lastStudied: "5 days ago" },
      { topic: "Recursion", mastery: 30, status: "struggling", lastStudied: "6 days ago" },
      { topic: "Trees", mastery: 15, status: "struggling", lastStudied: "1 week ago" },
      { topic: "Hash Tables", mastery: 44, status: "struggling", lastStudied: "4 days ago" },
    ],
  },
  {
    id: "stu3",
    name: "Amara Nwosu",
    courseId: "csc201",
    lastActive: "Yesterday",
    topics: [
      { topic: "Arrays", mastery: 97, status: "mastered", lastStudied: "Today" },
      { topic: "Linked Lists", mastery: 90, status: "mastered", lastStudied: "Today" },
      { topic: "Stacks & Queues", mastery: 85, status: "mastered", lastStudied: "1 day ago" },
      { topic: "Recursion", mastery: 70, status: "learning", lastStudied: "1 day ago" },
      { topic: "Trees", mastery: 60, status: "learning", lastStudied: "2 days ago" },
      { topic: "Hash Tables", mastery: 78, status: "learning", lastStudied: "2 days ago" },
    ],
  },
];

// ---------- Course documents (PDFs etc.) ----------

export interface CourseDocument {
  id: string;
  title: string;
  courseId: string;
  module: string;
  topic: string;
  pages: number;
  sizeKb: number;
  uploadedBy: string;
  summary: string;
  content?: string;
}

export const documents: CourseDocument[] = [
  {
    id: "d1",
    title: "Linked Lists — Lecture Notes.pdf",
    courseId: "csc201",
    module: "Module 3",
    topic: "Linked Lists",
    pages: 12,
    sizeKb: 840,
    uploadedBy: teacher.name,
    summary: "Formal definitions, a Big-O comparison table vs. arrays, and 6 practice problems on singly/doubly linked lists.",
  },
  {
    id: "d2",
    title: "Recursion Cheat Sheet.pdf",
    courseId: "csc201",
    module: "Module 5",
    topic: "Recursion",
    pages: 6,
    sizeKb: 410,
    uploadedBy: teacher.name,
    summary: "Base-case patterns, tracing recursion trees by hand, and the most common exam pitfalls.",
  },
  {
    id: "d3",
    title: "Trees & BST Slides.pdf",
    courseId: "csc201",
    module: "Module 6",
    topic: "Trees",
    pages: 24,
    sizeKb: 1560,
    uploadedBy: teacher.name,
    summary: "Lecture slide deck covering tree terminology, the BST invariant, and in-order/pre-order/post-order traversal.",
  },
  {
    id: "d4",
    title: "Hash Tables Reading.pdf",
    courseId: "csc201",
    module: "Module 7",
    topic: "Hash Tables",
    pages: 10,
    sizeKb: 700,
    uploadedBy: teacher.name,
    summary: "Textbook excerpt on hashing strategies, collision resolution, and load-factor analysis.",
  },
  {
    id: "d5",
    title: "Stacks & Queues Worksheet.pdf",
    courseId: "csc201",
    module: "Module 4",
    topic: "Stacks & Queues",
    pages: 5,
    sizeKb: 320,
    uploadedBy: teacher.name,
    summary: "Practice worksheet applying LIFO/FIFO structures to real interview-style problems.",
  },
  {
    id: "d6",
    title: "Calculus II — Series Notes.pdf",
    courseId: "mth210",
    module: "Unit 4",
    topic: "Series & Sequences",
    pages: 15,
    sizeKb: 990,
    uploadedBy: teacher.name,
    summary: "Convergence tests with fully worked examples for the ratio, root, and comparison tests.",
  },
];
