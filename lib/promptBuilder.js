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

## [Period] Reflections (only if highlights or lowlights provided)
What went well, what fell short. Use specific examples, names, and metrics. End with the takeaway that sets up the forward direction.

## Context and Problem Statement
Open with the headline data point. Explain current state in 2-3 short paragraphs with data woven in. Call out affected segments. End with the proposed theme.

## Problem Breakdown (if problems provided)
Markdown table: **Problem** | **Details** | **Supporting Datapoints** | **Key Success Metrics**
Each row = one distinct problem. Don't merge or generalize.

## Key Themes and Focus Areas
For each theme, write a ### sub-section:
- Why this theme matters (tie to problems above)
- What we're doing, with enough detail to be actionable
- What's deprioritized within this theme and why

## Release Calendar (if provided)
Markdown table adapted to the input format.

## Trade-offs
Markdown table: **Project / Feature** | **Decision** | **Rationale** | **Implication / Follow-up**
Each row = a deliberate choice not to do something.

## Risks and Mitigation
Markdown table: **Risk** | **Proposed Mitigation**
Be specific. "Monitor" is not a mitigation.

## Open Questions and Gaps
Bullet list of what's still TBD.

## Appendix (if raw data provided)
Clean Markdown tables with labels.

RAW INPUT

**Product Area:** ${a.visionArea || "-"}
**Planning Period:** ${a.visionPeriod || "-"}

**Current State:**
${a.visionCurrentState || "-"}

**Highlights (what went well):**
${a.visionHighlights || "-"}

**Lowlights (what fell short):**
${a.visionLowlights || "-"}

**Data / Metrics:**
${a.visionFunnelData || "-"}

**User Research / Qualitative:**
${a.visionUserResearch || "-"}

**Problems:**
${a.visionProblems || "-"}

**Key Themes / Direction:**
${a.visionTheme || "-"}

**Initiatives:**
${a.visionInitiatives || "-"}

**Release Calendar:**
${a.visionReleaseCalendar || "-"}

**Trade-offs (what we're NOT doing):**
${a.visionTradeoffs || "-"}

**Deprioritized items:**
${a.visionDeprioritized || "-"}

**Risks:**
${a.visionRisks || "-"}

**Open Questions:**
${a.visionOpenQuestions || "-"}
`.trim();
  }

  return "Unknown doc type.";
}

export const SYSTEM_PROMPT = `
You are a documentation assistant for a product team. Turn rough notes into structured documents ready for stakeholders.

Writing rules — follow strictly:
- State facts and move on. Don't build up to a point or add narrative transitions between sections.
- Lead with specifics: name the component, screen, flow, metric, or tool. Don't abstract.
- Use numbers wherever available: "< 1% CTR", "1/4 of the space", "-13% from Jan to Apr".
- Write in active voice, present tense: "Masthead takes up 1/4 of the space" not "The masthead has been observed to occupy a significant portion."
- Use "i.e." for inline examples. Use numbered lists for structured points.
- Keep bullets as factual statements. Each bullet = one point. No decorating.
- Don't sugarcoat: say "subpar", "ineffective", "not working" when that's what the data shows.
- Don't use filler: avoid "it's worth noting", "importantly", "significantly", "notably", "leveraging", "driving alignment", "unlocking value", "meaningful impact", "key insight", "compelling".
- Don't use dramatic framing: avoid "early warning signs", "this is critical", "the opportunity is immense", "game-changing". Just state what the data shows and what we're doing.
- If something is rough or incomplete, say so plainly: "TBD — need analysis" or "TBD — pending design".
- Include the WHY inline with the statement, not as a separate sentence: "Remove masthead from home, which takes up 1/4 of the above fold space with < 1% CTR" — not "Remove masthead. The reason is that it has low CTR."
- Match input language. If input mixes English and Bahasa, keep it. If input uses specific jargon (i.e. ATC%, VHS/HS, S2ID), preserve it exactly.
- Preserve all numbers, proper nouns, and acronyms exactly as given.
- Do NOT invent metrics, data, or facts. If something is missing, write "TBD" or "-".
- "Out of Scope" should be specific: not "we won't do X" but "we will keep X as-is" or "X will be handled manually for now".

Formatting:
- Use ## for main section headings.
- Use ### for sub-sections.
- Use **bold** for key terms, component names, and metrics.
- Use - for bullet points. Keep them factual and one point per bullet.
- Use numbered lists for sequential items or prioritized lists.
- Use Markdown tables where the doc type calls for them.
`.trim();
