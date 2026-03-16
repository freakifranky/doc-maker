"use client";

import { useState, useRef } from "react";
import { DOC_TYPES, FORM_FIELDS, LABEL_MAP } from "@/lib/formConfig";

export default function Home() {
  const [docType, setDocType] = useState("prd");
  const [answers, setAnswers] = useState({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const outputRef = useRef(null);

  const fields = FORM_FIELDS[docType] || [];

  function handleTypeChange(e) {
    setDocType(e.target.value);
    setAnswers({});
    setOutput("");
    setStatus("");
  }

  function handleFieldChange(field, value) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate() {
    setLoading(true);
    setStatus("Talking to Claude…");
    setOutput("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, answers }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setOutput(`Error (${res.status}): ${errData.error || "Unknown error"}`);
        setStatus("Failed.");
        return;
      }

      const data = await res.json();
      setOutput(data.content || "(No content returned)");
      setStatus("Done.");

      setTimeout(() => {
        setStatus((prev) => (prev === "Done." ? "" : prev));
      }, 2000);
    } catch (err) {
      console.error("Fetch error:", err);
      setOutput("Network error. Check if the server is running.");
      setStatus("Failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setStatus("Copied!");
      setTimeout(() => setStatus(""), 1200);
    } catch {
      if (outputRef.current) {
        const range = document.createRange();
        range.selectNodeContents(outputRef.current);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Product Document Maker</h1>
        <p className="app-subtitle">
          No time to create docs? I got you! Let&apos;s turn your scribbles
          into tangible output.
        </p>
      </header>

      <section className="controls">
        <div className="field">
          <label htmlFor="docType">Document type</label>
          <select id="docType" value={docType} onChange={handleTypeChange}>
            {DOC_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <main className="layout">
        <section className="card">
          <h2>Inputs</h2>
          <div className="form-scroll">
            {fields.map((field) => {
              const fallback = field.replace(/([A-Z])/g, " $1");
              const label = LABEL_MAP[field] || fallback;
              return (
                <div className="field" key={field}>
                  <label htmlFor={field}>{label}</label>
                  <textarea
                    id={field}
                    rows={3}
                    value={answers[field] || ""}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}…`}
                  />
                </div>
              );
            })}
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
            <span className="status">{status}</span>
          </div>
        </section>

        <section className="card">
          <div className="output-header">
            <h2>Output</h2>
            {output && (
              <button className="secondary-btn" onClick={handleCopy}>
                Copy
              </button>
            )}
          </div>
          <pre className="output-area" ref={outputRef}>
            {output || (
              <span className="output-placeholder">
                Your generated document will appear here.
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
