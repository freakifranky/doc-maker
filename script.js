// =======================
// FIELD DEFINITIONS
// =======================
const forms = {
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
    "openItems"
  ],

  mom: ["audience", "meetingNotes", "actionItems"],

  onepager: [
    "context",
    "objective",
    "successMetrics",
    "expectedOutput",
    "rolloutStrategy"
  ],

  experiment: [
    "expContext",
    "hypothesis",
    "metricsRaw",
    "whatWorked",
    "whatDidnt",
    "decision",
    "nextSteps"
  ]
};


// =======================
// RENDER FORM FIELDS
// =======================
function renderForm(type) {
  const container = document.getElementById("form");
  container.innerHTML = "";

  forms[type].forEach(field => {
    const labelText = field.replace(/([A-Z])/g, " $1"); // camelCase → spaced

    const div = document.createElement("div");
    div.className = "field";

    div.innerHTML = `
      <label for="${field}">${labelText}</label>
      <textarea id="${field}" rows="3"></textarea>
    `;

    container.appendChild(div);
  });
}

document.getElementById("docType")
  .addEventListener("change", (e) => {
    renderForm(e.target.value);
  });

renderForm("prd"); // initial load


// =======================
// GENERATE HANDLER
// (with loading + errors)
// =======================
const generateBtn = document.getElementById("generate");
const outputEl = document.getElementById("output");
const statusEl = document.getElementById("status");

generateBtn.addEventListener("click", async () => {
  const type = document.getElementById("docType").value;

  // Collect inputs
  const answers = {};
  forms[type].forEach(field => {
    answers[field] = document.getElementById(field)?.value || "";
  });

  // --- Loading state ---
  generateBtn.disabled = true;
  const originalBtnText = generateBtn.textContent;
  generateBtn.textContent = "Generating…";
  if (statusEl) statusEl.textContent = "Talking to the model…";
  outputEl.textContent = "";

  try {
    const res = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docType: type, answers })
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
    outputEl.textContent = "Network error. Check Node console.";
    if (statusEl) statusEl.textContent = "Failed.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = originalBtnText;

    // Clear status after 1.5s
    setTimeout(() => {
      if (statusEl && statusEl.textContent === "Done.") statusEl.textContent = "";
    }, 1500);
  }
});


// =======================
// COPY OUTPUT BUTTON
// =======================
const copyBtn = document.getElementById("copyOutput");

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
