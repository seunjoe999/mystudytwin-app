import type { StudentRecord } from "../data/mockData";

export function buildAsdtSystemPrompt(student: StudentRecord): string {
  const topicList = student.topics
    .map((t) => `${t.topic}: ${t.mastery}% mastery (${t.status}), last studied ${t.lastStudied.toLowerCase()}`)
    .join("; ");

  return `You are ASDT, ${student.name}'s Adaptive Student Digital Twin, speaking to their teacher. You know ${student.name}'s real performance data below and nothing else — be concise, factual, and helpful for a teacher deciding how to support this student. Never invent data not given here.

${student.name}'s data: ${topicList}. Last active: ${student.lastActive.toLowerCase()}.

Answer the teacher's question about ${student.name} using only this data.`;
}

export function generateAsdtReply(question: string, student: StudentRecord): string {
  const q = question.toLowerCase().trim();
  const sorted = [...student.topics].sort((a, b) => a.mastery - b.mastery);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  const avg = Math.round(student.topics.reduce((a, t) => a + t.mastery, 0) / student.topics.length);
  const struggling = student.topics.filter((t) => t.status === "struggling");

  if (!q) {
    return `I'm ${student.name}'s ASDT — ask me about their mastery, weak spots, or engagement and I'll answer from their actual activity data.`;
  }

  if (/^(hi|hello|hey)\b/.test(q)) {
    return `Hi — I'm ${student.name}'s Adaptive Student Digital Twin. Ask me how they're doing, what they're struggling with, or when they last studied.`;
  }

  if (q.includes("struggl") || q.includes("weak") || q.includes("risk") || q.includes("worst")) {
    if (struggling.length === 0) return `${student.name} isn't flagged as struggling on anything right now — strongest area is ${strongest.topic} at ${strongest.mastery}%.`;
    return `${student.name} is struggling most with ${weakest.topic} (${weakest.mastery}% mastery). ${
      struggling.length > 1 ? `Also flagged: ${struggling.filter((t) => t.topic !== weakest.topic).map((t) => `${t.topic} (${t.mastery}%)`).join(", ")}.` : ""
    } Last studied that topic ${weakest.lastStudied.toLowerCase()}.`;
  }

  if (q.includes("strong") || q.includes("best") || q.includes("master")) {
    return `${student.name}'s strongest topic is ${strongest.topic} at ${strongest.mastery}% mastery — that one's marked mastered.`;
  }

  if (q.includes("active") || q.includes("last") || q.includes("engage")) {
    return `${student.name} was last active ${student.lastActive.toLowerCase()}.`;
  }

  if (q.includes("overall") || q.includes("average") || q.includes("how is") || q.includes("doing")) {
    return `${student.name} is at ${avg}% overall mastery across ${student.topics.length} topics. ${
      struggling.length > 0 ? `${struggling.length} topic(s) are flagged as struggling — start with ${weakest.topic}.` : "Nothing is currently flagged as struggling."
    }`;
  }

  const matchedTopic = student.topics.find((t) => q.includes(t.topic.toLowerCase()));
  if (matchedTopic) {
    return `On ${matchedTopic.topic}, ${student.name} is at ${matchedTopic.mastery}% (${matchedTopic.status}), last studied ${matchedTopic.lastStudied.toLowerCase()}.`;
  }

  return `${student.name} is at ${avg}% overall mastery. Ask me things like "what is ${student.name} struggling with?" or "when were they last active?"`;
}
