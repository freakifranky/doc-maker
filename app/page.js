"use client";

import { useState, useRef, useCallback } from "react";
import {
  DOC_TYPES,
  FORM_SECTIONS,
  LABEL_MAP,
  PLACEHOLDER_MAP,
} from "@/lib/formConfig";

export default function Home() {
  const [docType, setDocType] = useState("prd");
  const [answers, setAnswers] = useState({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const outputRef = useRef(null);

  const sections = FORM_SECTIONS[docType] || [];
  const currentType = DOC_TYPES.find((d) => d.value === docType);

  function handleTypeChange(value) {
    setDocType(value);
    setAnswers({});
    setOutput("");
    setStatus("");
  }

  function handleFieldChange(field, value) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    setStatus("Talking to Claude\u2026");
    setOutput("");

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

  const handleDownload = useCallback(() => {
    if (!output) return;

    const docTitle = currentType
      ? `${currentType.label} \u2013 ${currentType.description}`
      : "Document";

    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>${docTitle}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; margin: 1in; }
  pre { font-family: Calibri, Arial, sans-serif; font-size: 11pt; white-space: pre-wrap; word-wrap: break-word; }
</style>
</head>
<body>
<pre>${output.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>`.trim();

    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const fileName = `${currentType?.label || "doc"}-${new Date().toISOString().slice(0, 10)}.doc`;
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setStatus("Downloaded! \u{1F4E5}");
    setTimeout(() => setStatus(""), 1500);
  }, [output, currentType]);

  const sectionKey = docType;

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-icon">{"\u{270F}\u{FE0F}"}</span>
        <h1>
          Doc <span className="highlight">Maker</span>v2
        </h1>
        <p className="app-subtitle">
          Scribble your rough notes. Get polished docs. 
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
            <span className={`status ${status.includes("Done") || status.includes("Copied") || status.includes("Downloaded") ? "success" : ""}`}>
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
                <button className="secondary-btn" onClick={handleCopy}>
                  {"\u{1F4CB}"} Copy
                </button>
                <button className="secondary-btn" onClick={handleDownload}>
                  {"\u{1F4E5}"} Download
                </button>
              </div>
            )}
          </div>
          <pre className="output-area" ref={outputRef}>
            {output || (
              <span className="output-placeholder">
                <span className="placeholder-icon">{"\u{1F4AD}"}</span>
                Fill in the fields and hit Generate.
                {"\n"}Your polished document will appear here!
              </span>
            )}
          </pre>
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
