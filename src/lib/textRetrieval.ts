// Pure text-processing helpers shared by the PDF ingestion pipeline and the
// ATDT/ASDT reply generators. Kept dependency-free (no pdfjs-dist, no DOM
// APIs) so they can run in any environment, including plain Node test runs.

export function quickSummary(text: string, maxSentences = 3): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 20);
  if (sentences.length <= maxSentences) return sentences.join(" ");
  const scored = sentences.map((s) => ({ s, score: s.length }));
  scored.sort((a, b) => b.score - a.score);
  return scored
    .slice(0, maxSentences)
    .map((x) => x.s)
    .join(" ");
}

export function findRelevantPassage(text: string, query: string, chunkSize = 600): string | null {
  if (!text) return null;
  const queryWords = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  if (queryWords.length === 0) return text.slice(0, chunkSize);

  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  let best = chunks[0];
  let bestScore = -1;
  for (const chunk of chunks) {
    const lower = chunk.toLowerCase();
    const score = queryWords.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = chunk;
    }
  }
  return bestScore > 0 ? best : null;
}
