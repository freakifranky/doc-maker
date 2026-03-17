// lib/promptBuilder.js

export function buildPromptForType(docType, a) {

  // =========================
  // PRD
  // =========================
  if (docType === "prd") {
    // Build dynamic milestone sections
    const milestoneBlocks = (a._milestones || []).map((m, i) => {
      const num = i + 1;
      return `
Milestone ${num}: ${m.mbTitle || "(untitled)"}

- Objective: ${m.mbObjective || "-"}
- Scope: ${m.mbScope || "-"}
- Out of Scope: ${m.mbOutOfScope || "-"}
- User Stories (raw): ${m.mbUserStories || "-"}
- Analytics: ${m.mbAnalytics || "-"}
- Rollout: ${m.mbRollout || "-"}
- Risks: ${m.mbRisks || "-"}
`.trim();
    }).join("\n\n");

    return `
You are helping a product team write a Product Requirements Document (PRD).

Style guidelines:
- Use Markdown formatting for structure and readability.
- Use ## for main section headings (e.g. ## 1. Current Situation).
- Use ### for sub-section headings (e.g. ### 7.1 Objective).
- Use **bold** for key terms, field labels, and emphasis.
- Use - for bullet points.
- Use Markdown tables where specified.
- Short, clear sentences. Product-thinking, no fluff.
- Ensure the result follows the input language (if input is in English, output in English).
- Never talk about yourself as an assistant or AI. Stay neutral and professional.
- Keep proper nouns and acronyms unchanged (e.g. GoMart, ATC%, CRM).

Formatting rules for user stories:
- Rewrite user stories into a Markdown table.
- Columns: Code, No, Scenario/Screen, Requirement, Notes.
- Code = milestone and story code (e.g. M1.1, M1.2). Use the milestone number as prefix.
- No = sequential number (0, 1, 2…).
- Scenario/Screen = short description with priority tags like [P0], [P1].
- Requirement = GIVEN/WHEN/THEN format, followed by **Acceptance Criteria:** with numbered sub-items.
- Notes = extra context or "-" if nothing.
- Group by perspective (e.g. **Customer POV**, **Internal/Ops POV**) if applicable.

Structure the PRD like this:

## 1. Current Situation
- **Today:** <rewrite and clarify>
- **Why Now (Context Trigger):** <rewrite and clarify>

## 2. Problem Statement
- What is the problem
- Where it shows up (segments, surfaces, flows)

## 3. Target Users
- Who is impacted / primary and secondary user groups

## 4. Objective
- What we want to achieve and why it matters

## 5. Success Metrics
- **Primary metrics**
- **Guardrail metrics**
- Any directional or qualitative checks

## 6. Milestones
- High-level phases or key checkpoints

## 7. Milestone Breakdown

For EACH milestone provided below, create a subsection:

### 7.N <Milestone Title>

#### 7.N.1 Objective
#### 7.N.2 Scope
#### 7.N.3 Out of Scope
#### 7.N.4 User Stories
(Use the table format described above)
#### 7.N.5 Analytics / Clickstream Requirements
(Group by P0, P1, P2)
#### 7.N.6 Rollout Strategy
#### 7.N.7 Risks and Mitigation

## 8. Open Items

RAW INPUT

**Current situation (today):**
${a.backgroundToday || "-"}

**Why now (context trigger):**
${a.backgroundWhyNow || "-"}

**Problem statement:**
${a.problemStatement || "-"}

**Target users:**
${a.problemUsers || "-"}

**Objective:**
${a.objective || "-"}

**Success metrics:**
${a.successMetrics || "-"}

**Milestones (overview):**
${a.milestones || "-"}

**Milestone Details:**
${milestoneBlocks || "No milestones provided."}

**Open Items:**
${a.openItems || "-"}
`.trim();
  }

  // =========================
  // MoM
  // =========================
  if (docType === "mom") {
    return `
You are helping a team write meeting notes (MoM) that will be pasted into a Lark chat.

Style guidelines:
- Use Markdown formatting: ## for section headings, **bold** for names and key decisions.
- Short, clear bullets. No repetition.
- Summarise decisions, key points, and clear follow-ups.
- Never refer to yourself as an assistant or AI.
- Use role- or name-based owners for action items.

RAW INPUT

**MoM Title:** ${a.momTitle || "-"}
**Audience:** ${a.audience || "-"}
**Participants:** ${a.participants || "-"}
**Meeting Notes:** ${a.meetingNotes || "-"}
**Action Items:** ${a.actionItems || "-"}

Generate the final MoM:

## MoM – <cleaned-up title>

### Audience
- ...

### Participants
- ...

### Meeting Notes
- ...

### Action Items
- **<Owner>** - <clear action with ETA if mentioned>
`.trim();
  }

  // =========================
  // One-Pager
  // =========================
  if (docType === "onepager") {
    return `
You are helping a product team write a one-pager (short product brief).

Style guidelines:
- Use Markdown: ## for headings, **bold** for key terms.
- Concise, outcome-focused.
- Never refer to yourself as an assistant or AI.

Structure:

## 1. Context
- Brief background and why this matters now.

## 2. Objective
- What we want to achieve and how we'll know it's working.

## 3. Success Metrics
- **Primary metrics**
- **Guardrails**

## 4. Expected Output
- Concrete artefacts, changes, or decisions.

## 5. Rollout Strategy
- Phasing and communication notes.

RAW INPUT

**Context:** ${a.context || "-"}
**Objective:** ${a.objective || "-"}
**Success Metrics:** ${a.successMetrics || "-"}
**Expected Output:** ${a.expectedOutput || "-"}
**Rollout Strategy:** ${a.rolloutStrategy || "-"}
`.trim();
  }

  // =========================
  // Experiment Summary
  // =========================
  if (docType === "experiment") {
    return `
You are helping a team write an experiment summary after a test finishes.

Style guidelines:
- Use Markdown: ## for headings, **bold** for metrics and decisions.
- Honest, concise, focused on learnings.
- Never refer to yourself as an assistant or AI.

Structure:

## 1. Context
## 2. Hypothesis
## 3. Metrics
## 4. What Worked
## 5. What Didn't Work
## 6. Decision
## 7. Next Steps
## 8. Key Learnings (3-5 bullets)

RAW INPUT

**Context:** ${a.expContext || "-"}
**Hypothesis:** ${a.hypothesis || "-"}
**Metrics:** ${a.metricsRaw || "-"}
**What worked:** ${a.whatWorked || "-"}
**What didn't work:** ${a.whatDidnt || "-"}
**Decision:** ${a.decision || "-"}
**Next Steps:** ${a.nextSteps || "-"}
`.trim();
  }

  // =========================
  // Experiment Design
  // =========================
  if (docType === "experimentDesign") {
    return `
You are helping a product team write a pre-experiment design document.

Style guidelines:
- Use Markdown: ## for headings, **bold** for key terms.
- Precise, testable language.
- Never refer to yourself as an assistant or AI.

Structure:

## 1. Background
## 2. Hypothesis
(Format: "We believe that **<change>** will **<effect>** for **<audience>**, measured by **<metric>**.")
## 3. Experiment Setup
(Surface, variants, audience split, duration)
## 4. Primary Metrics
## 5. Secondary Metrics
## 6. Guardrail Metrics
## 7. Risks and Mitigations
## 8. Dependencies
## 9. Timeline
## 10. Open Questions

RAW INPUT

**Background:** ${a.edBackground || "-"}
**Hypothesis:** ${a.edHypothesis || "-"}
**Setup:** ${a.edSetup || "-"}
**Primary Metrics:** ${a.edPrimaryMetrics || "-"}
**Secondary Metrics:** ${a.edSecondaryMetrics || "-"}
**Guardrails:** ${a.edGuardrails || "-"}
**Risks:** ${a.edRisks || "-"}
**Dependencies:** ${a.edDependencies || "-"}
**Timeline:** ${a.edTimeline || "-"}
**Open Questions:** ${a.edOpenQuestions || "-"}
`.trim();
  }

  // =========================
  // GTM
  // =========================
  if (docType === "gtm") {
    return `
You are helping a product team write a Go-To-Market (GTM) plan.

This document has TWO main parts:
1. **Go-To-Market Strategy** (summary table)
2. **Production Checklist** (activities tracker table)

Style guidelines:
- Use Markdown: ## for main headings, **bold** for emphasis.
- Use Markdown tables for both sections.
- Practical, action-oriented.
- Never refer to yourself as an assistant or AI.

## Go-To-Market Strategy

Create a table with columns: **Category** | **Details**

Rows: Objective, Use Case, Timeline, Location / Users, In-App Experience, Variants, Marketing, Product Development, Component, Inventory, Metrics / Goals, Health Metrics, Operational Requirements, Key Risks, Pre-requisites, Success Metrics and Criteria to Progress.

## Production Checklist

Create a table with columns: **Activities** | **Details** | **PIC** | **ETA** | **Status** | **Ref**

Typical activities: Testing completed, Deployment Backend/Frontend ready, Asset preparation, Component setup, Experiment/Litmus setup, CMS setup, Alpha launch, Start experiment, Customer comms, Conclude experiment, Post-evaluation feedback.

For missing info use "TBD" for dates/status and "-" for empty fields.

RAW INPUT

**Objective:** ${a.gtmObjective || "-"}
**Success Metrics:** ${a.gtmSuccessMetrics || "-"}
**Rollout Principles:** ${a.gtmRolloutPrinciples || "-"}
**Milestones:** ${a.gtmMilestones || "-"}
**Production Checklist:** ${a.gtmProductionChecklist || "-"}
**Rollout Strategy:** ${a.gtmRolloutStrategy || "-"}
**Open Items:** ${a.gtmOpenItems || "-"}
**UX Checklist:** ${a.gtmUxChecklist || "-"}
**Ops Checklist:** ${a.gtmOpsChecklist || "-"}
**Clickstream:** ${a.gtmClickstream || "-"}
**Evaluation:** ${a.gtmEvaluation || "-"}
`.trim();
  }

  // =========================
  // Vision Doc
  // =========================
  if (docType === "vision") {
    return `
You are helping a product team write a strategic vision document that outlines the problem landscape, funnel analysis, and proposed direction for an upcoming planning period (e.g. H2'25).

Style guidelines:
- Use Markdown: ## for main headings, ### for sub-headings, **bold** for key terms and metrics.
- Use Markdown tables for the problem breakdown (columns: Problem, Details, Supporting Datapoints, Key Success Metrics).
- Data-driven: preserve all numbers, percentages, and trends exactly as provided.
- Keep proper nouns, segment names, and acronyms unchanged (e.g. GoMart, VHS/HS, ATC%, SCR%).
- Never refer to yourself as an assistant or AI.
- The document should read as a stakeholder-ready strategic brief.

Structure the document like this:

## Context and Problem Statement
- Summarize the current state: what's happening with the funnel, key trends, and why this matters now.
- Include key data points and trend direction (e.g. "ATC session declined by -13% from Jan to Apr").
- Call out the most affected segments (e.g. New Users, VHS/HS).
- State the proposed key theme for the period.

## Problem Breakdown

Create a Markdown table with columns: **Problem** | **Details** | **Supporting Datapoints** | **Key Success Metrics**

Each row should be a distinct problem area. For each:
- **Problem** = short problem title
- **Details** = 1-2 sentence explanation of what's happening
- **Supporting Datapoints** = numbered list of data points, research references
- **Key Success Metrics** = the metric that measures success for this problem

## Proposed Solution
- State the overarching theme and strategic framing.
- Describe the distribution of effort (e.g. "80% fundamental improvements, 20% carryover/hygiene").
- List the proposed initiatives grouped by area (e.g. Home, Search, PDP, Reorder).
- For each initiative, use tags where provided: **[NEW]**, **[Spillover H1]**, **[Proposed H2]**.
- Use a numbered/nested list structure matching the input.

## Future Iteration
- What's planned for next and later phases.
- Any parking decisions or sequencing notes.

## Appendix
- Reformat any supporting data into clean Markdown tables.
- Preserve all numbers exactly as given.
- Label each table clearly.

RAW INPUT

**Context and Problem Statement:**
${a.visionContext || "-"}

**Funnel Data / Key Metrics:**
${a.visionFunnelData || "-"}

**Problems Breakdown:**
${a.visionProblems || "-"}

**Proposed Key Theme:**
${a.visionTheme || "-"}

**Solution Breakdown / Initiatives:**
${a.visionSolutionBreakdown || "-"}

**Future Iteration:**
${a.visionFutureIteration || "-"}

**Appendix / Supporting Data:**
${a.visionAppendix || "-"}
`.trim();
  }

  return "Unknown doc type.";
}

export const SYSTEM_PROMPT = `
You are Franky's personal documentation assistant.

Your job:
Turn rough, shorthand notes into clean, structured documents in Franky's voice
that are ready to share with stakeholders (Eng, Design, BI, leads, etc.).

Franky's style:
- Clear, concise, and practical
- Product-thinking first: problem > context > impact
- Uses metrics (ATC%, CTR, CVR) when mentioned
- Short paragraphs, smart bullet points
- No buzzwords or fluff
- Sounds like a senior PM, not textbook

Formatting rules:
- Use Markdown formatting for structure.
- Use ## for main section headings.
- Use ### for sub-sections.
- Use **bold** for key terms, labels, and emphasis.
- Use - for bullet points.
- Use Markdown tables where the doc type calls for them.
- Do NOT invent fake metrics or facts.
- Keep vague items as TBD.
`.trim();
