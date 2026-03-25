"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { marked } from "marked";
import {
  DOC_TYPES,
  FORM_SECTIONS,
  MILESTONE_FIELDS,
  LABEL_MAP,
  PLACEHOLDER_MAP,
} from "@/lib/formConfig";

marked.setOptions({ breaks: true, gfm: true });

const DEFAULT_MILESTONE = () => ({
  id: Date.now(),
  mbTitle: "",
  mbObjective: "",
  mbScope: "",
  mbOutOfScope: "",
  mbUserStories: "",
  mbAnalytics: "",
  mbRollout: "",
  mbRisks: "",
});

// Parse CSV text to readable table string
function parseCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return text;
  const maxRows = 50; // Cap to avoid huge prompts
  const rows = lines.slice(0, maxRows);
  const result = rows.join("\n");
  if (lines.length > maxRows) {
    return result + `\n... (${lines.length - maxRows} more rows truncated)`;
  }
  return result;
}

// Read file as base64 or text
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    if (
      file.type.startsWith("image/") 
    ) {
      reader.onload = () => {
        const base64 = reader.result.split(",")[1];
        resolve({ type: "image", data: base64, mediaType: file.type, name: file.name });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else if (
      file.type === "text/csv" ||
      file.name.endsWith(".csv") ||
      file.name.endsWith(".tsv")
    ) {
      reader.onload = () => {
        const parsed = parseCSV(reader.result);
        resolve({ type: "csv", data: parsed, name: file.name });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    } else {
      reject(new Error(`Unsupported file type: ${file.type || file.name}`));
    }
  });
}

export default function Home() {
  const [docType, setDocType] = useState("prd");
  const [answers, setAnswers] = useState({});
  const [milestones, setMilestones] = useState([DEFAULT_MILESTONE()]);
  const [fieldAttachments, setFieldAttachments] = useState({}); // { fieldKey: [{ type, data, mediaType, name }] }
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [viewMode, setViewMode] = useState("formatted");
  const [exporting, setExporting] = useState(false);
  const outputRef = useRef(null);

  const sections = FORM_SECTIONS[docType] || [];
  const currentType = DOC_TYPES.find((d) => d.value === docType);

  const renderedHtml = useMemo(() => {
    if (!output) return "";
    try { return marked(output); } catch { return output; }
  }, [output]);

  // Count total attachments
  const totalAttachments = Object.values(fieldAttachments).reduce(
    (sum, arr) => sum + arr.length, 0
  );

  function handleTypeChange(value) {
    setDocType(value);
    setAnswers({});
    setMilestones([DEFAULT_MILESTONE()]);
    setFieldAttachments({});
    setOutput("");
    setStatus("");
    setViewMode("formatted");
  }

  function handleFieldChange(field, value) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  // Attachment handlers
  async function handleAttach(fieldKey, fieldLabel, files) {
    const newAttachments = [];
    for (const file of files) {
      try {
        const processed = await readFile(file);
        processed.fieldKey = fieldKey;
        processed.fieldLabel = fieldLabel;
        newAttachments.push(processed);
      } catch (err) {
        console.error("File read error:", err);
        setStatus(`Unsupported: ${file.name}`);
        setTimeout(() => setStatus(""), 2000);
      }
    }
    if (newAttachments.length > 0) {
      setFieldAttachments((prev) => ({
        ...prev,
        [fieldKey]: [...(prev[fieldKey] || []), ...newAttachments],
      }));
    }
  }

  function removeAttachment(fieldKey, idx) {
    setFieldAttachments((prev) => {
      const updated = [...(prev[fieldKey] || [])];
      updated.splice(idx, 1);
      if (updated.length === 0) {
        const next = { ...prev };
        delete next[fieldKey];
        return next;
      }
      return { ...prev, [fieldKey]: updated };
    });
  }

  // Milestone handlers
  function addMilestone() {
    setMilestones((prev) => [...prev, DEFAULT_MILESTONE()]);
  }

  function removeMilestone(idx) {
    setMilestones((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  }

  function updateMilestone(idx, field, value) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  }

  async function handleGenerate() {
    setLoading(true);
    setStatus(totalAttachments > 0 ? `Processing ${totalAttachments} attachment${totalAttachments > 1 ? "s" : ""}\u2026` : "Talking to Claude\u2026");
    setOutput("");
    setViewMode("formatted");

    const payload = { ...answers };
    if (docType === "prd") {
      payload._milestones = milestones;
    }

    // Flatten all attachments
    const allAttachments = Object.values(fieldAttachments).flat();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          answers: payload,
          attachments: allAttachments.length > 0 ? allAttachments : undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setOutput(`Error (${res.status}): ${errData.error || "Unknown error"}`);
        setStatus("Failed.");
        return;
      }

      const data = await res.json();
      setOutput(data.content || "(No content returned)");
      setStatus("Done! \u{1F389}");
      setTimeout(() => setStatus((p) => (p === "Done! \u{1F389}" ? "" : p)), 3000);
    } catch (err) {
      console.error(err);
      setOutput("Network error.");
      setStatus("Failed.");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setStatus("Copied! \u{1F4CB}");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      if (outputRef.current) {
        const r = document.createRange();
        r.selectNodeContents(outputRef.current);
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
      }
    }
  }, [output]);

  const handleDownloadDocx = useCallback(async () => {
    if (!output || exporting) return;
    setExporting(true);
    setStatus("Generating .docx\u2026");
    const title = currentType ? `${currentType.label} - ${currentType.description}` : "Document";

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: output, title }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentType?.label || "doc"}-${new Date().toISOString().slice(0, 10)}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("Downloaded! \u{1F4E5}");
      setTimeout(() => setStatus(""), 1500);
    } catch {
      const blob = new Blob([output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentType?.label || "doc"}-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("Downloaded as .txt");
      setTimeout(() => setStatus(""), 2000);
    } finally {
      setExporting(false);
    }
  }, [output, currentType, exporting]);

  function renderField(fieldKey, value, onChange, label, placeholder) {
    const atts = fieldAttachments[fieldKey] || [];

    return (
      <div className="field" key={fieldKey}>
        <label htmlFor={fieldKey}>{label}</label>
        <textarea
          id={fieldKey}
          rows={2}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        {/* Attachment thumbnails */}
        {atts.length > 0 && (
          <div className="attachment-list">
            {atts.map((att, idx) => (
              <div className="attachment-chip" key={idx}>
                {att.type === "image" ? (
                  <img
                    src={`data:${att.mediaType};base64,${att.data}`}
                    alt={att.name}
                    className="attachment-thumb"
                  />
                ) : (
                  <span className="attachment-file-icon">{"\u{1F4C4}"}</span>
                )}
                <span className="attachment-name">{att.name}</span>
                <button
                  className="attachment-remove"
                  onClick={() => removeAttachment(fieldKey, idx)}
                  title="Remove"
                >
                  {"\u{2715}"}
                </button>
              </div>
            ))}
          </div>
        )}
        {/* Attach button */}
        <label className="attach-btn" title="Attach image or CSV">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,.csv,.tsv"
            multiple
            className="attach-input"
            onChange={(e) => {
              if (e.target.files.length > 0) {
                handleAttach(fieldKey, label, Array.from(e.target.files));
                e.target.value = "";
              }
            }}
          />
          {"\u{1F4CE}"} Attach
        </label>
      </div>
    );
  }

  function renderFieldSimple(field, value, onChange) {
    const label = LABEL_MAP[field] || field.replace(/([A-Z])/g, " $1");
    const placeholder = PLACEHOLDER_MAP[field] || "";
    return renderField(field, value, onChange, label, placeholder);
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-icon">{"\u{270F}\u{FE0F}"}</span>
        <h1>Doc <span className="highlight">Maker</span></h1>
        <p className="app-subtitle">Scribble your rough notes. Get polished docs. Powered by Claude.</p>
      </header>

      <div className="doc-type-section">
        <div className="doc-type-label">What are we writing?</div>
        <div className="doc-type-grid">
          {DOC_TYPES.map((dt) => (
            <button key={dt.value} className={`doc-type-chip ${docType === dt.value ? "active" : ""}`} onClick={() => handleTypeChange(dt.value)}>
              {dt.emoji} {dt.label}
            </button>
          ))}
        </div>
        <p className="doc-type-description">{currentType?.description}</p>
      </div>

      <main className="layout">
        <section className="card">
          <div className="card-title">
            <span className="card-emoji">{"\u{1F4DD}"}</span> Inputs
            {totalAttachments > 0 && (
              <span className="attachment-badge">{totalAttachments} file{totalAttachments > 1 ? "s" : ""}</span>
            )}
          </div>
          <div className="form-scroll" key={docType}>
            {sections.map((section) => {
              if (section.dynamic === "milestones") {
                return (
                  <div key="milestones-container">
                    {milestones.map((ms, idx) => (
                      <div className="form-section milestone-section" key={ms.id}>
                        <div className="section-title">
                          <span className="section-emoji">{section.emoji}</span>
                          Milestone {idx + 1}
                          {milestones.length > 1 && (
                            <button className="remove-milestone-btn" onClick={() => removeMilestone(idx)} title="Remove milestone">
                              {"\u{2716}"}
                            </button>
                          )}
                        </div>
                        <div className="field">
                          <label>Milestone Title</label>
                          <textarea
                            rows={1}
                            value={ms.mbTitle || ""}
                            onChange={(e) => updateMilestone(idx, "mbTitle", e.target.value)}
                            placeholder={PLACEHOLDER_MAP.mbTitle}
                            className="milestone-title-input"
                          />
                        </div>
                        {MILESTONE_FIELDS.map((field) => {
                          const fieldKey = `${field}_${idx}`;
                          const label = LABEL_MAP[field] || field;
                          const placeholder = PLACEHOLDER_MAP[field] || "";
                          return renderField(
                            fieldKey,
                            ms[field],
                            (val) => updateMilestone(idx, field, val),
                            label,
                            placeholder
                          );
                        })}
                      </div>
                    ))}
                    <button className="add-milestone-btn" onClick={addMilestone}>
                      + Add Milestone
                    </button>
                  </div>
                );
              }

              return (
                <div className="form-section" key={section.title}>
                  <div className="section-title">
                    <span className="section-emoji">{section.emoji}</span>
                    {section.title}
                  </div>
                  {section.fields.map((field) =>
                    renderFieldSimple(field, answers[field], (val) => handleFieldChange(field, val))
                  )}
                </div>
              );
            })}
          </div>
          <div className="actions-row">
            <button className="primary-btn" onClick={handleGenerate} disabled={loading}>
              {loading ? (<span className="loading-dots">Generating<span>.</span><span>.</span><span>.</span></span>) : ("\u{2728} Generate")}
            </button>
            <span className={`status ${status.includes("Done") || status.includes("Copied") || status.includes("Downloaded") ? "success" : ""}`}>{status}</span>
          </div>
        </section>

        <section className="card output-card">
          <div className="output-header">
            <div className="card-title"><span className="card-emoji">{"\u{1F4C4}"}</span> Output</div>
            {output && (
              <div className="output-actions">
                <button className={`toggle-btn ${viewMode === "formatted" ? "active" : ""}`} onClick={() => setViewMode("formatted")}>Formatted</button>
                <button className={`toggle-btn ${viewMode === "raw" ? "active" : ""}`} onClick={() => setViewMode("raw")}>Raw</button>
                <div className="action-divider" />
                <button className="secondary-btn" onClick={handleCopy}>{"\u{1F4CB}"} Copy</button>
                <button className="secondary-btn" onClick={handleDownloadDocx} disabled={exporting}>{exporting ? "\u{23F3}" : "\u{1F4E5}"} .docx</button>
              </div>
            )}
          </div>
          {output ? (
            viewMode === "formatted" ? (
              <div className="output-formatted" ref={outputRef} dangerouslySetInnerHTML={{ __html: renderedHtml }} />
            ) : (
              <pre className="output-raw" ref={outputRef}>{output}</pre>
            )
          ) : (
            <div className="output-empty">
              <span className="placeholder-icon">{"\u{1F4AD}"}</span>
              <p>Fill in the fields and hit Generate.</p>
              <p>You can also attach screenshots or CSVs to any field.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Vibe-coded with {"\u{2615}"} by <a href="https://github.com/freakifranky" target="_blank" rel="noopener noreferrer">@frnkygabriel</a></p>
      </footer>
    </div>
  );
}
