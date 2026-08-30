// Unified AI access with graceful degradation:
//  1. Try the user's local Ollama instance (direct browser fetch — works when
//     the viewer's own machine is running Ollama, e.g. during a live demo).
//  2. Try the Vercel serverless function (/api/chat) — only responds if a
//     hosted API key has been configured in the deployment's environment.
//  3. Return null so callers fall back to the deterministic offline logic.

const OLLAMA_BASE = "http://localhost:11434";
const OLLAMA_MODEL_KEY = "mystudytwin.ollamaModel";
const TIMEOUT_MS = 6000;
const SERVERLESS_TIMEOUT_MS = 12000; // hosted models (e.g. Gemini) can take longer than local Ollama

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(id) };
}

export async function isOllamaAvailable(): Promise<boolean> {
  const { signal, cancel } = withTimeout(1500);
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal });
    cancel();
    return res.ok;
  } catch {
    cancel();
    return false;
  }
}

export async function listOllamaModels(): Promise<string[]> {
  const { signal, cancel } = withTimeout(1500);
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal });
    cancel();
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models ?? []).map((m: { name: string }) => m.name);
  } catch {
    cancel();
    return [];
  }
}

export function getPreferredOllamaModel(): string {
  return localStorage.getItem(OLLAMA_MODEL_KEY) || "";
}

export function setPreferredOllamaModel(model: string) {
  localStorage.setItem(OLLAMA_MODEL_KEY, model);
}

async function askOllama(systemPrompt: string, userMessage: string): Promise<string | null> {
  const model = getPreferredOllamaModel();
  if (!model) return null;

  const { signal, cancel } = withTimeout(TIMEOUT_MS);
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
      signal,
    });
    cancel();
    if (!res.ok) return null;
    const data = await res.json();
    return data?.message?.content?.trim() || null;
  } catch {
    cancel();
    return null;
  }
}

async function askServerless(systemPrompt: string, userMessage: string): Promise<string | null> {
  const { signal, cancel } = withTimeout(SERVERLESS_TIMEOUT_MS);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, userMessage }),
      signal,
    });
    cancel();
    if (!res.ok) return null;
    const data = await res.json();
    return data?.text?.trim() || null;
  } catch {
    cancel();
    return null;
  }
}

export interface HostedBackendStatus {
  backend: "gemini" | "ollama-cloud" | "anthropic" | "openai" | "none";
  model?: string;
}

export async function getHostedBackendStatus(): Promise<HostedBackendStatus> {
  const { signal, cancel } = withTimeout(4000);
  try {
    const res = await fetch("/api/chat", { signal });
    cancel();
    if (!res.ok) return { backend: "none" };
    return (await res.json()) as HostedBackendStatus;
  } catch {
    cancel();
    return { backend: "none" };
  }
}

export async function askAI(systemPrompt: string, userMessage: string): Promise<string | null> {
  const ollamaReply = await askOllama(systemPrompt, userMessage);
  if (ollamaReply) return ollamaReply;
  return askServerless(systemPrompt, userMessage);
}
