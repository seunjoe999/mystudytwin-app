import { useState } from "react";
import { Search, Play, FileText, Upload, X, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { videos, type CourseDocument } from "../data/mockData";
import { useAppState } from "../state/AppState";
import { useNavigate } from "react-router-dom";
import { makePdfBlobUrl } from "../lib/pdf";
import { extractTextFromPdf, quickSummary } from "../lib/pdfExtract";

function openDocumentPdf(d: CourseDocument) {
  const body = d.content
    ? [d.summary, "", "--- Digested excerpt ---", d.content.slice(0, 3000)]
    : [d.summary, `This document is ${d.pages} pages in the course library, filed under ${d.topic} for ${d.module}.`];
  const url = makePdfBlobUrl(d.title.replace(/\.pdf$/i, ""), `${d.module} · ${d.topic} · Uploaded by ${d.uploadedBy}`, body);
  window.open(url, "_blank");
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const { currentCourse, addDocument } = useAppState();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState(currentCourse.topics[0]?.topic ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "digesting" | "done">("idle");

  const onFileChange = (f: File | null) => {
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.pdf$/i, ""));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (file) {
      setStatus("digesting");
      try {
        const { text, pageCount } = await extractTextFromPdf(file);
        addDocument({
          title: title.trim().endsWith(".pdf") ? title.trim() : `${title.trim()}.pdf`,
          courseId: currentCourse.id,
          module: "New Upload",
          topic,
          pages: pageCount,
          sizeKb: Math.round(file.size / 1024),
          uploadedBy: "Dr. Ade Bello",
          summary: text ? quickSummary(text) : "ATDT ingested this file but could not extract readable text from it.",
          content: text,
        });
        setStatus("done");
      } catch {
        addDocument({
          title: title.trim().endsWith(".pdf") ? title.trim() : `${title.trim()}.pdf`,
          courseId: currentCourse.id,
          module: "New Upload",
          topic,
          pages: 1,
          sizeKb: Math.round(file.size / 1024),
          uploadedBy: "Dr. Ade Bello",
          summary: "Could not parse this PDF's text — it may be scanned/image-based.",
        });
        setStatus("done");
      }
    } else {
      addDocument({
        title: title.trim().endsWith(".pdf") ? title.trim() : `${title.trim()}.pdf`,
        courseId: currentCourse.id,
        module: "New Upload",
        topic,
        pages: 8,
        sizeKb: 480,
        uploadedBy: "Dr. Ade Bello",
        summary: "Newly uploaded material — ATDT will reference it in student tutoring sessions.",
      });
      setStatus("done");
    }
    setTimeout(onClose, 600);
  };

  return (
    <form className="card card-pad stack" onSubmit={submit} style={{ marginBottom: 16 }}>
      <div className="row-between">
        <div className="h2" style={{ margin: 0 }}>
          <Upload size={16} /> Upload Material
        </div>
        <button type="button" className="icon-btn" style={{ color: "var(--navy)" }} onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        style={{ fontSize: 13 }}
      />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title, e.g. Graph Traversal Notes"
        style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}>
          {currentCourse.topics.map((t) => (
            <option key={t.topic} value={t.topic}>
              {t.topic}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" type="submit" disabled={status === "digesting"}>
          {status === "digesting" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={14} className="spin" /> ATDT is digesting...
            </span>
          ) : status === "done" ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={14} /> Ingested
            </span>
          ) : (
            "Upload"
          )}
        </button>
      </div>
      {file && <p className="muted" style={{ fontSize: 11 }}>{file.name} will be parsed client-side and its real text digested for ATDT tutoring.</p>}
    </form>
  );
}

export function Library() {
  const { currentCourse, watchedVideoIds, role, documents } = useAppState();
  const [query, setQuery] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const navigate = useNavigate();

  const courseVideos = videos.filter((v) => v.courseId === currentCourse.id);
  const courseDocs = documents.filter((d) => d.courseId === currentCourse.id);

  const filteredVideos = courseVideos.filter(
    (v) => v.title.toLowerCase().includes(query.toLowerCase()) || v.module.toLowerCase().includes(query.toLowerCase())
  );
  const filteredDocs = courseDocs.filter(
    (d) => d.title.toLowerCase().includes(query.toLowerCase()) || d.topic.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="main-content">
      <div className="page-scroll stack">
        <div className="row-between">
          <div>
            <h1 className="h1">Library</h1>
            <p className="muted">All videos and course documents for {currentCourse.title}.</p>
          </div>
          {role === "teacher" && !showUpload && (
            <button className="btn btn-navy" onClick={() => setShowUpload(true)}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Upload size={14} /> Upload Material
              </span>
            </button>
          )}
        </div>

        {role === "teacher" && showUpload && <UploadForm onClose={() => setShowUpload(false)} />}

        <div className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Search size={16} color="var(--text-faint)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos, documents, or modules..."
            style={{ border: "none", outline: "none", fontSize: 13, width: "100%" }}
          />
        </div>

        <div>
          <div className="h2">Videos</div>
          <div className="grid-auto">
            {filteredVideos.map((v) => (
              <div key={v.id} className="vcard" onClick={() => navigate("/")}>
                <div className="vcard-thumb" style={{ background: v.thumbnailGradient }}>
                  {v.aiPick && <span className="vcard-pick">AI PICK</span>}
                  <span className="vcard-duration">{v.duration}</span>
                  <Play size={22} />
                </div>
                <div className="vcard-body">
                  <div className="vcard-title">{v.title}</div>
                  <div className="vcard-sub">
                    {v.module} {watchedVideoIds.has(v.id) && "· Watched"}
                  </div>
                </div>
              </div>
            ))}
            {filteredVideos.length === 0 && <p className="muted">No videos match "{query}".</p>}
          </div>
        </div>

        <div>
          <div className="h2">Documents</div>
          <div className="stack">
            {filteredDocs.map((d) => (
              <div key={d.id} className="card">
                <div className="doc-card" onClick={() => setOpenDocId(openDocId === d.id ? null : d.id)} style={{ cursor: "pointer" }}>
                  <div className="doc-icon">
                    <FileText size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="row-between">
                      <div className="vcard-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {d.title}
                        {d.content && (
                          <span className="badge" style={{ background: "rgba(0,200,83,0.1)", color: "var(--green)" }}>
                            Digested
                          </span>
                        )}
                      </div>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "4px 10px", fontSize: 11 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDocumentPdf(d);
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <ExternalLink size={12} /> Open PDF
                        </span>
                      </button>
                    </div>
                    <div className="vcard-sub">
                      {d.module} · {d.pages} pages · {(d.sizeKb / 1024).toFixed(1)} MB · Uploaded by {d.uploadedBy}
                    </div>
                    {openDocId === d.id && (
                      <p style={{ fontSize: 13, color: "var(--text)", marginTop: 10, lineHeight: 1.5 }}>{d.summary}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredDocs.length === 0 && <p className="muted">No documents match "{query}".</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
