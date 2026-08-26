import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, Settings, Maximize, Clock, Zap } from "lucide-react";
import { videos } from "../data/mockData";
import { useAppState } from "../state/AppState";
import { AtdtChat } from "../components/AtdtChat";
import { GapNegotiation } from "../components/GapNegotiation";
import { TeacherOverview } from "./TeacherOverview";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SelfTutoring() {
  const { currentCourse, markWatched, watchedVideoIds, role } = useAppState();
  const courseVideos = videos.filter((v) => v.courseId === currentCourse.id);
  const [activeId, setActiveId] = useState(courseVideos[0]?.id);
  const active = courseVideos.find((v) => v.id === activeId) ?? courseVideos[0];

  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setElapsed(0);
    setPlaying(false);
  }, [activeId]);

  useEffect(() => {
    if (playing && active) {
      timerRef.current = window.setInterval(() => {
        setElapsed((e) => {
          const next = e + 1;
          if (next >= active.durationSeconds) {
            window.clearInterval(timerRef.current!);
            markWatched(active.id);
            setPlaying(false);
            return active.durationSeconds;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, activeId]);

  if (role === "teacher") {
    return <TeacherOverview />;
  }

  if (!active) {
    return (
      <div className="main-content">
        <p className="muted">No videos available for this course yet.</p>
      </div>
    );
  }

  const pct = (elapsed / active.durationSeconds) * 100;

  const recommended = videos.filter((v) => v.courseId === currentCourse.id && v.id !== active.id);
  const nextUp = recommended.filter((v) => !watchedVideoIds.has(v.id)).slice(0, 2);

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setElapsed(Math.round(ratio * active.durationSeconds));
  };

  return (
    <div className="main-content">
      <div className="page-scroll stack">
        <div className="video-frame">
          <div style={{ background: active.thumbnailGradient, position: "absolute", inset: 0 }} />
          <div className="video-overlay-top">
            <div className="video-title">{active.title}</div>
            <div className="video-sub">
              {currentCourse.code}: {currentCourse.title.split(": ")[1]} • {active.module}
            </div>
          </div>
          <button className="play-btn" onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause size={26} /> : <Play size={26} style={{ marginLeft: 3 }} />}
          </button>
          <div className="video-controls">
            <div className="video-scrub" onClick={scrub}>
              <div className="video-scrub-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="video-controls-row">
              <div className="video-controls-left">
                <button className="icon-btn" onClick={() => setElapsed((e) => Math.max(0, e - 10))}>
                  <SkipBack size={16} />
                </button>
                <button className="icon-btn" onClick={() => setPlaying((p) => !p)}>
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button className="icon-btn" onClick={() => setElapsed((e) => Math.min(active.durationSeconds, e + 10))}>
                  <SkipForward size={16} />
                </button>
                <Volume2 size={14} />
                <span>{formatTime(elapsed)}</span>
              </div>
              <span>{active.duration}</span>
              <div className="video-controls-left">
                <Settings size={14} />
                <Maximize size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="h2">About This Video</div>
          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginBottom: 10 }}>{active.description}</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {active.tags.map((t) => (
              <span key={t} className="muted" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className="dot" style={{ width: 6, height: 6, background: "var(--coral)" }} /> {t}
              </span>
            ))}
          </div>
        </div>

        <GapNegotiation />

        <AtdtChat />

        <div>
          <div className="row-between" style={{ marginBottom: 10 }}>
            <div className="h2" style={{ margin: 0 }}>
              Recommended for You
            </div>
            <span className="muted">Based on your cognitive profile</span>
          </div>
          <div className="grid-auto">
            {recommended.map((v) => (
              <div key={v.id} className="vcard" onClick={() => setActiveId(v.id)}>
                <div className="vcard-thumb" style={{ background: v.thumbnailGradient }}>
                  {v.aiPick && <span className="vcard-pick">AI PICK</span>}
                  <span className="vcard-duration">{v.duration}</span>
                  <Play size={22} />
                </div>
                <div className="vcard-body">
                  <div className="vcard-title">{v.title}</div>
                  <div className="vcard-sub">{watchedVideoIds.has(v.id) ? "Watched" : v.module}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {nextUp.length > 0 && (
          <div className="card card-pad">
            <div className="h2">
              <Zap size={16} color="var(--coral)" /> Next Up
            </div>
            {nextUp.map((v) => (
              <div key={v.id} className="row-between" style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }} onClick={() => setActiveId(v.id)}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", cursor: "pointer" }}>{v.title}</span>
                <span className="muted" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={12} /> {v.duration}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
