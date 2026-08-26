import { useState } from "react";
import { ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";
import { useAppState } from "../state/AppState";
import { verifyChain, type ChainVerification } from "../lib/provenance";

export function AuditLog() {
  const { provenance } = useAppState();
  const [result, setResult] = useState<ChainVerification | null>(null);
  const [checking, setChecking] = useState(false);

  const verify = async () => {
    setChecking(true);
    const r = await verifyChain(provenance);
    setResult(r);
    setChecking(false);
  };

  return (
    <div className="main-content">
      <div className="page-scroll stack">
        <div>
          <h1 className="h1">Audit Log</h1>
          <p className="muted">
            Every twin decision — a message, an ingested document, a published question, an accepted scaffold — is
            appended to a SHA-256 hash chain, so any retroactive edit to an earlier entry is detectable. This is a
            client-side, per-browser integrity log (not a distributed ledger).
          </p>
        </div>

        <div className="card card-pad row-between">
          <span className="muted">{provenance.length} entries logged this session</span>
          <button className="btn btn-navy" onClick={verify} disabled={checking || provenance.length === 0}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {checking ? <RefreshCw size={14} className="spin" /> : <ShieldCheck size={14} />}
              Verify Chain Integrity
            </span>
          </button>
        </div>

        {result && (
          <div
            className="card card-pad"
            style={{ border: result.valid ? "1px solid var(--green)" : "1px solid var(--red)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {result.valid ? <ShieldCheck size={18} color="var(--green)" /> : <ShieldAlert size={18} color="var(--red)" />}
              <span style={{ fontWeight: 700, color: result.valid ? "var(--green)" : "var(--red)" }}>
                {result.valid ? "Chain intact — no tampering detected" : `Chain broken at entry #${result.brokenAtIndex}`}
              </span>
            </div>
          </div>
        )}

        <div className="card">
          <div className="stack" style={{ padding: 16, gap: 0 }}>
            {provenance.length === 0 && <p className="muted">No events logged yet — use the app to generate audit entries.</p>}
            {[...provenance].reverse().map((e) => (
              <div key={e.id} style={{ padding: "10px 0", borderTop: "1px solid var(--border)" }}>
                <div className="row-between">
                  <span style={{ fontWeight: 600, fontSize: 13, color: "var(--navy)" }}>
                    {e.actor} → {e.action}
                  </span>
                  <span className="muted" style={{ fontSize: 11 }}>
                    {new Date(e.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="muted" style={{ fontSize: 10, fontFamily: "var(--mono, monospace)", marginTop: 2, wordBreak: "break-all" }}>
                  hash: {e.hash.slice(0, 24)}… ← prev: {e.prevHash.slice(0, 12)}…
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
