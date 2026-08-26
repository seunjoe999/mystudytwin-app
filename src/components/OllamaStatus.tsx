import { useEffect, useState } from "react";
import { Zap, ZapOff, RefreshCw } from "lucide-react";
import { isOllamaAvailable, listOllamaModels, getPreferredOllamaModel, setPreferredOllamaModel } from "../lib/ai";

export function OllamaStatus() {
  const [checking, setChecking] = useState(true);
  const [available, setAvailable] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [selected, setSelected] = useState(getPreferredOllamaModel());

  const check = async () => {
    setChecking(true);
    const ok = await isOllamaAvailable();
    setAvailable(ok);
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
        <RefreshCw size={11} className="spin" /> Checking for local Ollama...
      </div>
    );
  }

  if (!available) {
    return (
      <div className="row-between" style={{ marginBottom: 8 }}>
        <span className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <ZapOff size={11} /> Using built-in tutor (still fully functional) — connect a local Ollama for live AI replies
        </span>
        <button className="btn btn-outline" style={{ padding: "2px 8px", fontSize: 10 }} onClick={check}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="row-between" style={{ marginBottom: 8 }}>
      <span className="muted" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
        <Zap size={11} color="var(--green)" /> Ollama connected —
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
