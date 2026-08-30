import { useEffect, useState } from "react";
import { Zap, ZapOff, RefreshCw } from "lucide-react";
import {
  isOllamaAvailable,
  listOllamaModels,
  getPreferredOllamaModel,
  setPreferredOllamaModel,
  getHostedBackendStatus,
  type HostedBackendStatus,
} from "../lib/ai";

const BACKEND_LABEL: Record<HostedBackendStatus["backend"], string> = {
  gemini: "Gemini",
  "ollama-cloud": "Ollama Cloud",
  anthropic: "Claude",
  openai: "GPT",
  none: "",
};

export function OllamaStatus() {
  const [checking, setChecking] = useState(true);
  const [localAvailable, setLocalAvailable] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selected, setSelected] = useState(getPreferredOllamaModel());
  const [hosted, setHosted] = useState<HostedBackendStatus>({ backend: "none" });

  const check = async () => {
    setChecking(true);
    const [ok, hostedStatus] = await Promise.all([isOllamaAvailable(), getHostedBackendStatus()]);
    setLocalAvailable(ok);
    setHosted(hostedStatus);
    if (ok) {
      const m = await listOllamaModels();
      setModels(m);
      if (!selected && m.length > 0) {
        setSelected(m[0]);
        setPreferredOllamaModel(m[0]);
      }
    }
    setChecking(false);
  };

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = (model: string) => {
    setSelected(model);
    setPreferredOllamaModel(model);
  };

  if (checking) {
    return (
      <div className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, marginBottom: 8 }}>
        <RefreshCw size={11} className="spin" /> Checking AI backend...
      </div>
    );
  }

  // Prefer showing local Ollama if it's actually running on this device.
  if (localAvailable) {
    return (
      <div className="row-between" style={{ marginBottom: 8 }}>
        <span className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <Zap size={11} color="var(--green)" /> Local Ollama connected —
        </span>
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          style={{ fontSize: 11, padding: "2px 6px", borderRadius: 6, border: "1px solid var(--border)" }}
        >
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (hosted.backend !== "none") {
    return (
      <div className="row-between" style={{ marginBottom: 8 }}>
        <span className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <Zap size={11} color="var(--green)" /> Live AI connected — {BACKEND_LABEL[hosted.backend]}
          {hosted.model ? ` (${hosted.model})` : ""}
        </span>
        <button className="btn btn-outline" style={{ padding: "2px 8px", fontSize: 10 }} onClick={check}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="row-between" style={{ marginBottom: 8 }}>
      <span className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
        <ZapOff size={11} /> Using built-in tutor (still fully functional) — no AI backend configured
      </span>
      <button className="btn btn-outline" style={{ padding: "2px 8px", fontSize: 10 }} onClick={check}>
        Retry
      </button>
    </div>
  );
}
