import type { GapDescriptor, ScaffoldCandidate } from "../lib/gaps";

// Renders the ASDT<->ATDT Tutoring Channel negotiation as an actual message
// exchange (gap.descriptor / scaffold.candidates / scaffold.accept), the
// same message types described in the architecture — so the negotiation
// that already runs as plain function calls is visible as communication
// between the two twins, not just a magic list of results.

export function TwinNegotiationLog({
  gap,
  candidates,
  acceptedTitle,
  asdtLabel = "ASDT",
  atdtLabel = "ATDT",
}: {
  gap: GapDescriptor;
  candidates: ScaffoldCandidate[];
  acceptedTitle?: string;
  asdtLabel?: string;
  atdtLabel?: string;
}) {
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="chat-bubble me" style={{ maxWidth: "100%" }}>
        <div style={{ fontSize: 10, opacity: 0.85, marginBottom: 3, fontWeight: 700 }}>
          {asdtLabel} → {atdtLabel} · gap.descriptor
        </div>
        <div>
          topic: <strong>{gap.topic}</strong> · type: {gap.gapType}
        </div>
        <div style={{ fontSize: 11, opacity: 0.9 }}>evidence: {gap.evidence.join("; ")}</div>
        <div style={{ fontSize: 11, opacity: 0.9 }}>ZPD estimate: {gap.zpdEstimate}%</div>
      </div>

      <div className="chat-bubble them" style={{ maxWidth: "100%" }}>
        <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 3, fontWeight: 700 }}>
          {atdtLabel} → {asdtLabel} · scaffold.candidates ({candidates.length})
        </div>
        {candidates.length === 0 && <div style={{ fontSize: 12 }}>No matching material found for this topic yet.</div>}
        {candidates.map((c) => (
          <div key={c.refId} style={{ fontSize: 12 }}>
            {c.kind === "video" ? "▶" : "📄"} {c.title} — ~{c.estMinutes} min (score {c.score.toFixed(0)})
          </div>
        ))}
      </div>

      {acceptedTitle && (
        <div className="chat-bubble me" style={{ maxWidth: "100%" }}>
          <div style={{ fontSize: 10, opacity: 0.85, marginBottom: 3, fontWeight: 700 }}>
            {asdtLabel} → {atdtLabel} · scaffold.accept
          </div>
          <div>
            "{acceptedTitle}" accepted — scheduled and logged to the provenance chain.
          </div>
        </div>
      )}
    </div>
  );
}
