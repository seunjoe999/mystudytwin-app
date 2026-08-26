import { weeklyMastery, weeklyStudyMinutes, statusColor, students, documents, videos } from "../data/mockData";
import { useAppState } from "../state/AppState";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Sparkline({ values, color = "#ff6f61" }: { values: number[]; color?: string }) {
  const w = 300;
  const h = 70;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth={2.5} />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r={3} fill="#001f5b" />;
      })}
    </svg>
  );
}

function StudentAnalytics() {
  const { currentCourse, watchedVideoIds } = useAppState();
  const topics = currentCourse.topics;
  const maxMinutes = Math.max(...weeklyStudyMinutes);
  const totalMinutes = weeklyStudyMinutes.reduce((a, b) => a + b, 0);
  const overallMastery = Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length);

  const roster = students.filter((s) => s.courseId === currentCourse.id);
  const classAvgByTopic = topics.map((t) => {
    const vals = roster.map((s) => s.topics.find((x) => x.topic === t.topic)?.mastery ?? 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  });

  const courseVideos = videos.filter((v) => v.courseId === currentCourse.id);
  const watchedCount = courseVideos.filter((v) => watchedVideoIds.has(v.id)).length;
  const watchPct = courseVideos.length ? Math.round((watchedCount / courseVideos.length) * 100) : 0;

  return (
    <div className="page-scroll stack">
      <div>
        <h1 className="h1">Analytics</h1>
        <p className="muted">Your learning trends for {currentCourse.title}.</p>
      </div>

      <div className="grid-3">
        <div className="card card-pad">
          <div className="muted">Overall Mastery</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--navy)" }}>{overallMastery}%</div>
        </div>
        <div className="card card-pad">
          <div className="muted">Study Time (7d)</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--navy)" }}>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>
        <div className="card card-pad">
          <div className="muted">Videos Watched</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--navy)" }}>
            {watchedCount}/{courseVideos.length}
          </div>
          <div className="progress-track thin" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ width: `${watchPct}%`, background: "var(--cyan)" }} />
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="h2">Mastery Trend (7 days)</div>
        <Sparkline values={weeklyMastery} />
        <div className="row-between" style={{ marginTop: 4 }}>
          {days.map((d) => (
            <span key={d} className="bar-label" style={{ flex: 1 }}>
              {d}
            </span>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <div className="h2">Study Minutes per Day</div>
        <div className="bars">
          {weeklyStudyMinutes.map((m, i) => (
            <div className="bar-col" key={i}>
              <div className="bar" style={{ height: `${(m / maxMinutes) * 100}%`, background: "var(--cyan)" }} title={`${m} min`} />
              <div className="bar-label">{days[i]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <div className="row-between">
          <div className="h2" style={{ margin: 0 }}>
            You vs. Class Average
          </div>
          <span className="muted" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="dot" style={{ width: 8, height: 8, background: "var(--coral)" }} /> You
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span className="dot" style={{ width: 8, height: 8, background: "#c7ccd6" }} /> Class avg
            </span>
          </span>
        </div>
        <div className="bars" style={{ height: 180, marginTop: 10 }}>
          {topics.map((t, i) => (
            <div className="bar-col" key={t.topic} style={{ position: "relative" }}>
              <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4 }}>
                <div className="bar" style={{ width: "45%", height: `${t.mastery}%`, background: statusColor(t.status) }} title={`You: ${t.mastery}%`} />
                <div className="bar" style={{ width: "45%", height: `${classAvgByTopic[i]}%`, background: "#c7ccd6" }} title={`Class: ${classAvgByTopic[i]}%`} />
              </div>
              <div className="bar-label">{t.topic}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeacherAnalytics() {
  const { currentCourse } = useAppState();
  const roster = students.filter((s) => s.courseId === currentCourse.id);
  const courseDocs = documents.filter((d) => d.courseId === currentCourse.id);
  const topics = currentCourse.topics;

  const classAvg = Math.round(
    roster.reduce((sum, s) => sum + s.topics.reduce((a, t) => a + t.mastery, 0) / s.topics.length, 0) / roster.length
  );

  const topicClassAvg = topics.map((t) => {
    const vals = roster.map((s) => s.topics.find((x) => x.topic === t.topic)?.mastery ?? 0);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  });

  const buckets = [
    { label: "0-40%", count: 0, color: "#ff3d00" },
    { label: "40-70%", count: 0, color: "#ffb300" },
    { label: "70-100%", count: 0, color: "#00c853" },
  ];
  roster.forEach((s) => {
    const avg = s.topics.reduce((a, t) => a + t.mastery, 0) / s.topics.length;
    if (avg < 40) buckets[0].count++;
    else if (avg < 70) buckets[1].count++;
    else buckets[2].count++;
  });
  const maxBucket = Math.max(...buckets.map((b) => b.count), 1);

  const sortedRoster = [...roster].sort((a, b) => {
    const avgA = a.topics.reduce((s, t) => s + t.mastery, 0) / a.topics.length;
    const avgB = b.topics.reduce((s, t) => s + t.mastery, 0) / b.topics.length;
    return avgA - avgB;
  });

  return (
    <div className="page-scroll stack">
      <div>
        <h1 className="h1">Class Analytics</h1>
        <p className="muted">Aggregate performance across {currentCourse.title}.</p>
      </div>

      <div className="grid-3">
        <div className="card card-pad">
          <div className="muted">Class Average Mastery</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--navy)" }}>{classAvg}%</div>
        </div>
        <div className="card card-pad">
          <div className="muted">Students Enrolled</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--navy)" }}>{roster.length}</div>
        </div>
        <div className="card card-pad">
          <div className="muted">Materials Uploaded</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--navy)" }}>{courseDocs.length}</div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="h2">Mastery Distribution</div>
        <div className="bars">
          {buckets.map((b) => (
            <div className="bar-col" key={b.label}>
              <div className="bar" style={{ height: `${(b.count / maxBucket) * 100}%`, background: b.color }} title={`${b.count} students`} />
              <div className="bar-label">
                {b.label} ({b.count})
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <div className="h2">Class Average by Topic</div>
        <div className="bars">
          {topics.map((t, i) => (
            <div className="bar-col" key={t.topic}>
              <div className="bar" style={{ height: `${topicClassAvg[i]}%`, background: topicClassAvg[i] < 50 ? "var(--red)" : topicClassAvg[i] < 75 ? "var(--amber)" : "var(--green)" }} title={`${topicClassAvg[i]}%`} />
              <div className="bar-label">{t.topic}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <div className="h2">Roster — sorted by risk</div>
        <div className="stack" style={{ gap: 4 }}>
          {sortedRoster.map((s) => {
            const avg = Math.round(s.topics.reduce((a, t) => a + t.mastery, 0) / s.topics.length);
            const weakest = [...s.topics].sort((a, b) => a.mastery - b.mastery)[0];
            return (
              <div key={s.id} className="row-between" style={{ padding: "8px 0", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "var(--navy)" }}>{s.name}</span>
                <span className="muted">
                  {avg}% avg · weakest: {weakest.topic} ({weakest.mastery}%) · active {s.lastActive.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Analytics() {
  const { role } = useAppState();
  return <div className="main-content">{role === "teacher" ? <TeacherAnalytics /> : <StudentAnalytics />}</div>;
}
