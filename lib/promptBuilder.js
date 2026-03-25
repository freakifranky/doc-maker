export function buildPromptForType(docType, a) {

  if (docType === "prd") {
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

  if (docType === "vision") {
    return `
You are writing a strategic vision document for a product team. This doc aligns leadership and cross-functional teams on what happened, what we're solving, and where we're headed.

This template works for quarterly planning docs, problem-focused deep-dives, and product strategy briefs.

Your job:
1. Take messy inputs and structure them clearly
2. Sharpen vague problems into distinct, actionable ones
3. Make trade-offs explicit — say what we're NOT doing and why
4. Be honest about gaps. Say "TBD — need analysis" when data is missing.
5. Don't add filler or dramatic framing. Let the data speak.

Generate ONLY the sections where meaningful input was provided. Skip sections where the input is "-" or empty.

Available sections:

## [Period]
