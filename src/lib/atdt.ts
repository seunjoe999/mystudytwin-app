import { type CourseDocument, type Topic, teacher } from "../data/mockData";
import { findRelevantPassage } from "./textRetrieval";

const teachingBlurbs: Record<string, string> = {
  "Linked Lists":
    "Think of a linked list as a chain of nodes, each holding data and a pointer to the next. Unlike an array, you don't need contiguous memory — insertion at the head is O(1) because you're just rewiring one pointer.",
  Recursion:
    "Every recursive function needs a base case that stops the recursion, and a recursive case that makes progress toward it. Trace it on paper first — draw the call stack — before you trust your code.",
  "Stacks & Queues":
    "A stack is LIFO — last in, first out — like a stack of plates. A queue is FIFO — first in, first out — like a line at a shop. Pick the one that matches the order your problem actually needs.",
  Trees:
    "A binary search tree keeps everything smaller than a node to its left, everything larger to its right. That invariant is what makes search, insert, and delete all O(log n) on a balanced tree.",
  "Hash Tables":
    "A hash function maps a key to a bucket index. Collisions are unavoidable at scale — chaining and open addressing are the two standard ways to handle them, each with different load-factor trade-offs.",
  Arrays:
    "Arrays give you O(1) index access because elements sit in contiguous memory — the address is just base + index * size. That's the trade-off against a linked list's flexible insertion.",
  "Series & Sequences":
    "Convergence tests — ratio, root, comparison — all answer the same question: does the sum settle down or blow up? Pick the test that matches the shape of the terms.",
};

export function buildAtdtSystemPrompt(courseTitle: string, courseDocs: CourseDocument[], topics: Topic[], question: string): string {
  const digested = courseDocs.filter((d) => d.content);
  const relevant = digested
    .map((d) => ({ d, passage: findRelevantPassage(d.content!, question) }))
    .filter((x) => x.passage);

  const context = relevant.length
    ? relevant.map((x) => `From "${x.d.title}":\n${x.passage}`).join("\n\n")
    : "No directly relevant uploaded material found for this question — answer from general knowledge of the topic, but stay in character.";

  const topicList = topics.map((t) => `${t.topic}: ${t.mastery}% mastery (${t.status})`).join(", ");

  return `You are ATDT, ${teacher.name}'s Adaptive Teacher Digital Twin for the course "${courseTitle}". You teach exactly the way ${teacher.name} does, using their real uploaded course material below. Be warm, concise, and instructional — like a good tutor, not a search engine. Never mention you are an AI language model; stay in character as the teacher's digital twin.

Student's current mastery by topic: ${topicList}

Relevant course material:
${context}

Answer the student's question below, grounding your explanation in the material where relevant, and referencing the student's mastery level if it's useful context.`;
}

export function generateAtdtReply(question: string, courseDocs: CourseDocument[], topics: Topic[]): string {
  const q = question.toLowerCase().trim();

  if (!q) return `Ask me anything about this course — I'm ${teacher.name}'s digital twin, here whenever they're not.`;

  if (/^(hi|hello|hey)\b/.test(q)) {
    return `Hey — I'm ATDT, ${teacher.name}'s teaching twin. I know everything they've lectured on and uploaded for this course, so treat me like office hours that never close. What are you working on?`;
  }

  const matchedDoc = courseDocs.find((d) => q.includes(d.topic.toLowerCase()));
  const matchedTopic = topics.find((t) => q.includes(t.topic.toLowerCase()));
  const blurb = matchedTopic ? teachingBlurbs[matchedTopic.topic] : undefined;

  // Prefer a real passage from the actual uploaded document over the canned blurb.
  const digestedPassage = matchedDoc?.content ? findRelevantPassage(matchedDoc.content, question) : null;

  if (matchedTopic && (blurb || digestedPassage)) {
    const risk = matchedTopic.status === "struggling" ? " I can see this is a rough spot for you right now — let's slow down." : "";
    const docNote = matchedDoc ? ` I've also put the fuller version of this in "${matchedDoc.title}" if you want to read it properly.` : "";
    const body = digestedPassage
      ? `Here's what I actually taught on this, from "${matchedDoc!.title}": "${digestedPassage.trim()}"`
      : blurb;
    return `${body}${risk} You're sitting at ${matchedTopic.mastery}% mastery here.${matchedDoc && !digestedPassage ? docNote : ""} Want a practice problem, or should I go deeper?`;
  }

  if (matchedDoc) {
    return `From what I taught in "${matchedDoc.title}": ${matchedDoc.summary}`;
  }

  if (q.includes("quiz") || q.includes("test me")) {
    return "Head to Exam Mode for a full timed set — or tell me a topic and I'll quiz you here first, one question at a time.";
  }

  if (q.includes("note") || q.includes("material") || q.includes("upload")) {
    const list = courseDocs.map((d) => `"${d.title}"`).join(", ");
    return `I've ingested everything ${teacher.name} has uploaded: ${list}. Ask about any of these topics and I'll teach it the same way they did in lecture.`;
  }

  if (q.includes("who") && q.includes("you")) {
    return `I'm ATDT — ${teacher.name}'s Adaptive Teacher Digital Twin. I've learned from their lectures and course materials, so I can tutor you in their style whenever they're not around.`;
  }

  return `I teach the way ${teacher.name} does, using their actual course material. Try asking about a specific topic — e.g. "explain recursion" or "what did the teacher upload on trees?"`;
}
