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
    setStatus("Generating…");
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
      setStatus("Done!");

      setTimeout(() => {
        setStatus((prev) => (prev === "Done!" ? "" : prev));
      }, 2500);
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
      setStatus("Copied!");
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
      ? `${currentType.label} – ${currentType.description}`
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

    setStatus("Downloaded!");
    setTimeout(() => setStatus(""), 1500);
  }, [output, currentType]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Doc Maker</h1>
        <span className="version-badge">v2</span>
        <p className="app-subtitle">
          Turn rough notes into polished product docs — powered by Claude.
        </p>
      </header>

      <div className="doc-type-grid">
        {DOC_TYPES.map((dt) => (
          <button
            key={dt.value}
            className={`doc-type-chip ${docType === dt.value ? "active" : ""}`}
            onClick={() => handleTypeChange(dt.value)}
          >
            {dt.label}
          </button>
        ))}
      </div>
      <p className="doc-type-description">{currentType?.description}</p>

      <main className="layout">
        <section className="card">
          <div className="card-title">Inputs</div>
          <div className="form-scroll">
            {sections.map((section) => (
              <div className="form-section" key={section.title}>
                <div className="section-title">{section.title}</div>
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
                  Generating<span>.</span><span>.</span><span>.</span>
                </span>
              ) : (
                "Generate"
              )}
            </button>
            <span className={`status ${status === "Done!" ? "success" : ""}`}>
              {status}
            </span>
          </div>
        </section>

        <section className="card output-card">
          <div className="output-header">
            <div className="card-title">Output</div>
            {output && (
              <div className="output-actions">
                <button className="secondary-btn" onClick={handleCopy}>
                  Copy
                </button>
                <button className="secondary-btn" onClick={handleDownload}>
                  Download .doc
                </button>
              </div>
            )}
          </div>
          <pre className="output-area" ref={outputRef}>
            {output || (
              <span className="output-placeholder">
                Fill in the fields and hit Generate.{"\n"}Your document will
                appear here.
              </span>
            )}
          </pre>
        </section>
      </main>

      <footer className="app-footer">
        <p>Vibe-coded by @frnkygabriel</p>
      </footer>
    </div>
  );
}
