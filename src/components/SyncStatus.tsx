import { Cloud, CloudOff } from "lucide-react";
import { useAppState } from "../state/AppState";

export function SyncStatus() {
  const { cloudSynced } = useAppState();

  if (cloudSynced) {
    return (
      <span className="pill" style={{ background: "rgba(0,200,83,0.1)", color: "var(--green)" }}>
        <Cloud size={12} /> Synced across devices
      </span>
    );
  }

  return (
    <span className="pill" style={{ background: "rgba(0,31,91,0.06)", color: "var(--text-muted)" }} title="Connect a cloud datastore (Vercel Storage → Redis) to sync messages across devices">
      <CloudOff size={12} /> Local only (this device)
    </span>
  );
}
