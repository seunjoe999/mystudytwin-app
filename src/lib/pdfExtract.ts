import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface ExtractedPdf {
  text: string;
  pageCount: number;
}

export async function extractTextFromPdf(file: File): Promise<ExtractedPdf> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pages.push(pageText);
  }

  const text = pages.join("\n\n").replace(/\s+/g, " ").trim();
  return { text, pageCount: pdf.numPages };
}

// Very small extractive summarizer: pick the sentences most likely to matter
// (longer, keyword-dense) so we have something reasonable to show even
// without an LLM in the loop.
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

// Naive passage retrieval: find the chunk of text most relevant to a query,
// used both for offline template answers and as grounding context for an LLM.
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
