// script.js

document.addEventListener("DOMContentLoaded", () => {
  // =======================
  // FIELD DEFINITIONS
  // =======================
  const forms = {
    // IDs unchanged for backward compatibility
    prd: [
      "backgroundToday",
      "backgroundWhyNow",
      "problemStatement",
      "problemUsers",
      "objective",
      "successMetrics",
      "milestones",
      "mbObjective",
      "mbScope",
      "mbOutOfScope",
      "mbUserStories",
      "mbAnalytics",
      "mbRollout",
      "mbRisks",
      "openItems",
    ],

    // MoM now includes title + participants, but keeps old fields
    mom: ["momTitle", "audience", "participants", "meetingNotes", "actionItems"],

    onepager: [
      "context",
      "objective",
      "successMetrics",
      "expectedOutput",
      "rolloutStrategy",
    ],

    experiment: [
      "expContext",
      "hypothesis",
      "metricsRaw",
      "whatWorked",
      "whatDidnt",
      "decision",
      "nextSteps",
    ],
  };

  // Friendly labels for fields (EYD-ish, user-facing)
  const labelMap = {
    // PRD
    backgroundToday: "Current Situation (today)",
    backgroundWhyNow: "Why Now (context trigger)",
    problemStatement: "Problem Statement",
    problemUsers: "Target Users",
    objective: "Objective",
    successMetrics: "Success Metrics",
    milestones: "Milestones",
    mbObjective: "Milestone Objective",
    mbScope: "Scope (in-scope)",
    mbOutOfScope: "Out of Scope",
    mbUserStories: "User Stories (raw)",
    mbAnalytics: "Analytics / Clickstream Requirements",
    mbRollout: "Rollout Strategy",
    mbRisks: "Risks and Mitigation (raw)",
    openItems: "Open Items / Questions",

    // MoM
    momTitle: "MoM Title (topic)",
    audience: "Audience (who needs to read this)",
    participants: "Participants (in the meeting)",
    meetingNotes: "Meeting Notes (raw)",
    actionItems: "Action Items (raw)",

    // One-pager
    context: "Context",
    expectedOutput: "Expected Output",
    rolloutStrategy: "Rollout Strategy",

    // Experiment
    expContext: "Experiment Context",
    hypothesis: "Hypothesis",
    metricsRaw: "Metrics (raw notes)",
    whatWorked: "What Worked",
    whatDidnt: "What Didn’t Work",
    decision: "Decision",
    nextSteps: "Next Steps",
  };

  const docTypeSelect = document.getElementById("docType");
  const formContainer = document.getElementById("form");
  const generateBtn = document.getElementById("generate");
  const outputEl = document.getElementById("output");
  const statusEl = document.getElementById("status");
  const copyBtn = document.getElementById("copyOutput");

  if (!docTypeSelect || !formContainer || !generateBtn || !outputEl) {
    console.error("Missing core DOM elements – check index.html IDs.");
    return;
  }

  // =======================
  // RENDER FORM FIELDS
  // =======================
  function renderForm(type) {
    formContainer.innerHTML = "";

    const fieldList = forms[type];
    if (!fieldList) return;

    fieldList.forEach((field) => {
      // If we know the label, use it; otherwise fall back to spaced camelCase
      const fallbackLabel = field.replace(/([A-Z])/g, " $1");
      const labelText = labelMap[field] || fallbackLabel;

      const div = document.createElement("div");
      div.className = "field";

      div.innerHTML = `
        <label for="${field}">${labelText}</label>
        <textarea id="${field}" rows="3"></textarea>
      `;

      formContainer.appendChild(div);
    });
  }

  docTypeSelect.addEventListener("change", (e) => {
    renderForm(e.target.value);
  });

  // initial load
  renderForm(docTypeSelect.value || "prd");

  // =======================
  // GENERATE HANDLER
  // (with loading + errors)
  // =======================
  generateBtn.addEventListener("click", async () => {
    const type = docTypeSelect.value;
    const fieldList = forms[type];

    if (!fieldList) {
      outputEl.textContent = "Unknown document type.";
      return;
    }

    // Collect inputs
    const answers = {};
    fieldList.forEach((field) => {
      answers[field] = document.getElementById(field)?.value || "";
    });

    // --- Loading state ---
    const originalBtnText = generateBtn.textContent;
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating…";
    if (statusEl) statusEl.textContent = "Talking to the model…";
    outputEl.textContent = "";

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: type, answers }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        outputEl.textContent = `Error (${res.status}):\n${errorText}`;
        if (statusEl) statusEl.textContent = "Failed.";
        return;
      }

      const data = await res.json();
      outputEl.textContent = data.content || "(No content returned)";
      if (statusEl) statusEl.textContent = "Done.";
    } catch (err) {
      console.error("Fetch error:", err);
      outputEl.textContent = "Network error. Check server logs.";
      if (statusEl) statusEl.textContent = "Failed.";
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = originalBtnText;

      // Clear status after 1.5s if success
      setTimeout(() => {
        if (statusEl && statusEl.textContent === "Done.") {
          statusEl.textContent = "";
        }
      }, 1500);
    }
  });

  // =======================
  // COPY OUTPUT BUTTON
  // =======================
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = outputEl.textContent.trim();
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);

        if (statusEl) {
          statusEl.textContent = "Copied!";
          setTimeout(() => {
            statusEl.textContent = "";
          }, 1200);
        }
      } catch (err) {
        console.error("Copy failed:", err);
        alert("Unable to copy automatically. You can select manually.");
      }
    });
  }
});
