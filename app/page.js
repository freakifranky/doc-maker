"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { marked } from "marked";
import {
  DOC_TYPES,
  FORM_SECTIONS,
  LABEL_MAP,
  PLACEHOLDER_MAP,
} from "@/lib/formConfig";

// Configure marked for tables and basic formatting
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function Home() {
  const [docType, setDocType] = useState("prd");
  const [answers, setAnswers] = useState({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [viewMode, setViewMode] = useState("formatted"); // "formatted" or "raw"
  const [exporting, setExporting] = useState(false);
  const outputRef = useRef(null);

  const sections = FORM_SECTIONS[docType] || [];
  const currentType = DOC_TYPES.find((d) => d.value === docType);

  const renderedHtml = useMemo(() => {
    if (!output) return "";
    try {
      return marked(output);
    } catch {
      return output;
    }
  }, [output]);

  function handleTypeChange(value) {
    setDocType(value);
    setAnswers({});
    setOutput("");
    setStatus("");
    setViewMode("formatted");
  }

  function handleFieldChange(field, value) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    setStatus("Talking to Claude\u2026");
    setOutput("");
    setViewMode("formatted");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, answers }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setOutput(
          `Error (${res.status}): ${errData.error || "Unknown error"}`
        );
        setStatus("Failed.");
        return;
      }

      const data = await res.json();
      setOutput(data.content || "(No content returned)");
      setStatus("Done! \u{1F389}");

      setTimeout(() => {
        setStatus((prev) => (prev === "Done! \u{1F389}" ? "" : prev));
      }, 3000);
    } catch (err) {
      console.error("Fetch error:", err);
      setOutput("Network error. Is the server running?");
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
        const range = document.createRange();
        range.selectNodeContents(outputRef.current);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }, [output]);

  const handleDownloadDocx = useCallback(async () => {
    if (!output || exporting) return;
    setExporting(true);
    setStatus("Generating .docx\u2026");

    const title = currentType
      ? `${currentType.label} - ${currentType.description}`
      : "Document";

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: output, title }),
      });

      if (!res.ok) {
        throw new Error("Export failed");
      }

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
    } catch (err) {
      console.error("Download error:", err);
      // Fallback to .txt
      const blob = new Blob([output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentType?.label || "doc"}-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("Downloaded as .txt (fallback)");
      setTimeout(() => setStatus(""), 2000);
    } finally {
      setExporting(false);
    }
  }, [output, currentType, exporting]);

  const sectionKey = docType;

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-icon">{"\u{270F}\u{FE0F}"}</span>
        <h1>
          Doc <span className="highlight">Maker</span>
        </h1>
        <p className="app-subtitle">
          Scribble your rough notes. Get polished docs. Powered by Claude.
        </p>
      </header>

      <div className="doc-type-section">
        <div className="doc-type-label">What are we writing?</div>
        <div className="doc-type-grid">
          {DOC_TYPES.map((dt) => (
            <button
              key={dt.value}
              className={`doc-type-chip ${
                docType === dt.value ? "active" : ""
              }`}
              onClick={() => handleTypeChange(dt.value)}
            >
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
          </div>
          <div className="form-scroll" key={sectionKey}>
            {sections.map((section) => (
              <div className="form-section" key={section.title}>
                <div className="section-title">
                  <span className="section-emoji">{section.emoji}</span>
                  {section.title}
                </div>
                {section.fields.map((field) => {
                  const fallback = field.replace(/([A-Z])/g, " $1");
                  const label = LABEL_MAP[field] || fallback;
                  const placeholder = PLACEHOLDER_MAP[field] || "";
                  return (
                    <div className="field" key={field}>
                      <label htmlFor={field}>{label}</label>
                      <textarea
                        id={field}
                        rows={2}
                        value={answers[field] || ""}
                        onChange={(e) =>
                          handleFieldChange(field, e.target.value)
                        }
                        placeholder={placeholder}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="actions-row">
            <button
              className="primary-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-dots">
                  Generating<span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              ) : (
                "\u{2728} Generate"
              )}
            </button>
            <span
              className={`status ${
                status.includes("Done") ||
                status.includes("Copied") ||
                status.includes("Downloaded")
                  ? "success"
                  : ""
              }`}
            >
              {status}
            </span>
          </div>
        </section>

        <section className="card output-card">
          <div className="output-header">
            <div className="card-title">
              <span className="card-emoji">{"\u{1F4C4}"}</span> Output
            </div>
            {output && (
              <div className="output-actions">
                <button
                  className={`toggle-btn ${viewMode === "formatted" ? "active" : ""}`}
                  onClick={() => setViewMode("formatted")}
                >
                  Formatted
                </button>
                <button
                  className={`toggle-btn ${viewMode === "raw" ? "active" : ""}`}
                  onClick={() => setViewMode("raw")}
                >
                  Raw
                </button>
                <div className="action-divider" />
                <button className="secondary-btn" onClick={handleCopy}>
                  {"\u{1F4CB}"} Copy
                </button>
                <button
                  className="secondary-btn"
                  onClick={handleDownloadDocx}
                  disabled={exporting}
                >
                  {exporting ? "\u{23F3}" : "\u{1F4E5}"} .docx
                </button>
              </div>
            )}
          </div>

          {output ? (
            viewMode === "formatted" ? (
              <div
                className="output-formatted"
                ref={outputRef}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <pre className="output-raw" ref={outputRef}>
                {output}
              </pre>
            )
          ) : (
            <div className="output-empty">
              <span className="placeholder-icon">{"\u{1F4AD}"}</span>
              <p>Fill in the fields and hit Generate.</p>
              <p>Your polished document will appear here!</p>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Vibe-coded with {"\u{2615}"} by{" "}
          <a
            href="https://github.com/freakifranky"
            target="_blank"
            rel="noopener noreferrer"
          >
            @frnkygabriel
          </a>
        </p>
      </footer>
    </div>
  );
}
