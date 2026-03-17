// lib/promptBuilder.js
// Builds the USER prompt for Claude based on doc type + raw answers.

export function buildPromptForType(docType, a) {
  // =========================
  // PRD – Product Requirements Document
  // =========================
  if (docType === "prd") {
    return `
You are helping a product team write a Product Requirements Document (PRD – Product Specification Document) that they will paste into a doc or Lark.

Style guidelines:
- Plain text only. Do NOT use '#' or '*' or code fences.
- Short, clear sentences. Product-thinking, no fluff.
- Use numbered section headings exactly as defined below.
- Use "-" for bullet points where helpful.
- You MAY use a simple Markdown table only in the "User Stories" subsection when requested.
- Follow good style capitalization: section titles capitalised, each sentence starts with a capital letter and ends with proper punctuation.
- Ensure the result follows the input (i.e. if the input in English use the output in English)
- Never talk about yourself as an assistant or AI. Stay neutral and professional.
- Keep proper nouns and acronyms unchanged (i.e. GoMart, VHS/HS, ATC%, CRM).

Formatting rules for user stories:
- Rewrite the user stories into a Markdown table.
- Columns: Code, No, Scenario/Screen, Requirement, Notes.
- Code = milestone and story code (e.g. M.1.1, M.1.2). Use the milestone number from section 7 as the prefix.
- No = sequential number within each code (0, 1, 2…).
- Scenario/Screen = short description of what the user sees or does. Use priority tags like [P0], [P1] at the start.
- Requirement = what needs to be true. Use GIVEN/WHEN/THEN format, followed by "Acceptance Criteria:" with numbered sub-items where applicable.
- Notes = extra context, references, open questions, or "See screenshot". Use "-" if nothing to add.
- If some details are missing, use "-" instead of inventing them.
- Group user stories by perspective if applicable (e.g. "Customer POV", "Internal/Ops POV").

Structure the final PRD exactly like this (keep the numbering and titles):

1. Current Situation
- Today: <rewrite and clarify>
- Why Now (Context Trigger): <rewrite and clarify>

2. Problem Statement
- What is the problem
- Where it shows up (segments, surfaces, flows)

3. Target Users
- Who is impacted / primary and secondary user groups

4. Objective
- What we want to achieve and why it matters to users and business

5. Success Metrics
- Primary metrics
- Guardrail metrics
- Any directional or qualitative checks

6. Milestones
- High-level phases or key checkpoints over time

7. Milestone Breakdown
7.1 Objective
- Clarify the objective for this milestone

7.2 Scope
- In-scope items, flows, or components

7.3 Out of Scope
- What is explicitly not included for this iteration

7.4 User Stories
- Start with a short list of user stories in this style:
  - [Px] As a <type of user>, I can <do something> so that <benefit>.
    GIVEN <precondition>,
    WHEN <user action>,
    THEN <expected outcome>.
    Acceptance Criteria:
    1. <specific acceptance criterion>
    2. <specific acceptance criterion>
- Then add a Markdown table with columns: Code, No, Scenario/Screen, Requirement, Notes.
- Group by perspective (e.g. "Customer POV", "Internal/Ops POV") if applicable.

7.5 Analytics / Clickstream Requirements
- Group by priority (P0, P1, P2)
- Describe what needs to be tracked and at which level (page, component, event)

7.6 Rollout Strategy
- Phasing (e.g. 10% → 30% → 50% → 70% → 100%)
- Cohorts, markets, or platforms if relevant

7.7 Risks and Mitigation
- Risk: ...
  - Mitigation: ...

8. Open Items
- Questions or dependencies that are still TBD

Use the raw notes below to fill these sections in your own words, while keeping the structure above.

RAW INPUT

Current situation (today):
${a.backgroundToday || "-"}

Why now (context trigger):
${a.backgroundWhyNow || "-"}

Problem statement:
${a.problemStatement || "-"}

Target users / who experiences it:
${a.problemUsers || "-"}

Objective:
${a.objective || "-"}

Success metrics:
${a.successMetrics || "-"}

Milestones:
${a.milestones || "-"}

Milestone breakdown - Objective:
${a.mbObjective || "-"}

Milestone breakdown - Scope:
${a.mbScope || "-"}

Milestone breakdown - Out of scope:
${a.mbOutOfScope || "-"}

Milestone breakdown - User Stories:
${a.mbUserStories || "-"}

Milestone breakdown - Analytics:
${a.mbAnalytics || "-"}

Milestone breakdown - Rollout:
${a.mbRollout || "-"}

Milestone breakdown - Risks:
${a.mbRisks || "-"}

Open Items:
${a.openItems || "-"}
`.trim();
  }

  // =========================
  // MoM – Minutes of Meeting
  // =========================
  if (docType === "mom") {
    return `
You are helping a team write meeting notes (MoM – Minutes of Meeting) that will be pasted directly into a Lark chat.

Style guidelines:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting.
- Short, clear bullets. No repetition, no over-explaining.
- Summarise decisions, key points, and clear follow-ups. Skip noisy back-and-forth discussion unless it changes a decision.
- Never refer to yourself as an assistant or AI. Never say "Franky to do" or "I/we as the model".
- Use role- or name-based owners for action items (e.g., "Growth team", "PM", "BI", or specific names) when available; otherwise use "TBD".
- Follow good capitalization: section titles capitalised, sentences start with capital letters and end with proper punctuation.

Use the fields below:
- momTitle = topic or focus of the meeting.
- audience = people or roles this MoM is relevant for.
- participants = people actually in the meeting.
- meetingNotes = raw notes (bullets / scribbles).
- actionItems = raw to-dos captured during the meeting.

RAW INPUT

MoM Title:
${a.momTitle || "-"}

Audience:
${a.audience || "-"}

Participants:
${a.participants || "-"}

Raw meeting notes:
${a.meetingNotes || "-"}

Raw action items:
${a.actionItems || "-"}

Now generate the final MoM in exactly this structure:

[MoM – Minutes of Meeting – <cleaned-up title>]

Audience:
- ...

Participants:
- ...

Meeting Notes:
- ...

Action Items:
- <Owner / role> - <clear action, include output or ETA if mentioned>

Thanks!
`.trim();
  }

  // =========================
  // One-Pager – Product Brief
  // =========================
  if (docType === "onepager") {
    return `
You are helping a product team write a one-pager (short product brief) that they will share with stakeholders.

Style guidelines:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting.
- Concise, outcome-focused.
- Use numbered headings exactly as defined below.
- Follow good capitalization: titles capitalised, sentences start with capital letters.
- Never refer to yourself as an assistant or AI.

Structure the final one-pager like this:

1. Context
- Brief background on what is happening today.
- Why this topic matters now (user + business angle).

2. Objective
- Clear statement of what we want to achieve.
- How we will know this effort is directionally "working".

3. Success Metrics
- Primary metrics we will look at.
- Any guardrails or qualitative checks.

4. Expected Output
- What concrete artefacts, changes, or decisions should exist after this work.
- How other teams (Eng, Design, BI, Ops) will use the output.

5. Rollout Strategy
- Phasing, cohorts, platforms, or markets.
- Any high-level communication or enablement notes.

Use the raw notes below to fill these sections, keeping the numbered heading structure above.

RAW INPUT

Context:
${a.context || "-"}

Objective:
${a.objective || "-"}

Success Metrics:
${a.successMetrics || "-"}

Expected Output:
${a.expectedOutput || "-"}

Rollout Strategy:
${a.rolloutStrategy || "-"}
`.trim();
  }

  // =========================
  // Experiment Summary – Post-Experiment Review
  // =========================
  if (docType === "experiment") {
    return `
You are helping a team write an experiment summary and learnings document after a test finishes.

Style guidelines:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting.
- Honest, concise, and focused on what we learned and what we will do next.
- Use numbered headings exactly as defined below.
- Follow good Indonesian/English capitalization.
- Never refer to yourself as an assistant or AI.

Structure the final document like this:

1. Context
- Short description of the experiment setup (surface, audience, key variation).
- Why we ran this test now.

2. Hypothesis
- Clear, testable statement in plain language.

3. Metrics
- Which metrics we looked at (primary, secondary, guardrails).
- High-level outcome in words (e.g., "ATC% moved slightly up, CVR flat").

4. What Worked
- Behaviours, patterns, or signals that looked promising.

5. What Didn't Work
- Negative or neutral outcomes, unexpected behaviours, or pitfalls.

6. Decision
- Ship, iterate, roll back, or park.
- Brief rationale tied to metrics and observations.

7. Next Steps
- Concrete follow-ups: new experiments, design tweaks, tech work, or analysis.

8. Key Learnings
- 3–5 bullets summarising what we now believe or understand better.

Use the raw notes below to fill these sections, keeping the numbered heading structure above.

RAW INPUT

Context:
${a.expContext || "-"}

Hypothesis:
${a.hypothesis || "-"}

Metrics (raw notes):
${a.metricsRaw || "-"}

What worked:
${a.whatWorked || "-"}

What didn't work:
${a.whatDidnt || "-"}

Decision:
${a.decision || "-"}

Next Steps:
${a.nextSteps || "-"}
`.trim();
  }

  // =========================
  // Experiment Design – Pre-Experiment Plan
  // =========================
  if (docType === "experimentDesign") {
    return `
You are helping a product team write a pre-experiment design document that will be reviewed by stakeholders before a test goes live.

Style guidelines:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting.
- Precise, testable language. Avoid vague phrases.
- Use numbered headings exactly as defined below.
- Follow good capitalization: titles capitalised, sentences start with capital letters.
- Never refer to yourself as an assistant or AI.
- Keep proper nouns and acronyms unchanged.

Structure the final document like this:

1. Background
- What is happening today that motivates this experiment.
- What prior data, insights, or user complaints triggered this idea.

2. Hypothesis
- Clear, falsifiable statement.
- Format: "We believe that <change> will <effect> for <audience>, measured by <metric>."

3. Experiment Setup
- Surface / feature / flow being tested.
- Variant descriptions (Control vs Treatment).
- Audience split and targeting criteria (e.g., new users, city X, platform).
- Duration estimate and sample size rationale if available.

4. Primary Metrics
- The metric(s) that will decide ship / no-ship.
- Expected direction and minimum detectable effect if known.

5. Secondary Metrics
- Supporting metrics to watch for context.

6. Guardrail Metrics
- Metrics that must NOT degrade (e.g., crash rate, support tickets, CVR of other flows).

7. Risks and Mitigations
- What could go wrong during the test.
- Mitigation or kill-switch plan.

8. Dependencies
- Eng work, design assets, data instrumentation, ops readiness.
- Any blockers or sequencing constraints.

9. Timeline
- Key dates: instrumentation ready, experiment start, expected read-out.

10. Open Questions
- Anything still TBD before launch.

Use the raw notes below to fill these sections, keeping the numbered heading structure above.

RAW INPUT

Background / context:
${a.edBackground || "-"}

Hypothesis (rough):
${a.edHypothesis || "-"}

Experiment setup / variants:
${a.edSetup || "-"}

Primary metrics:
${a.edPrimaryMetrics || "-"}

Secondary metrics:
${a.edSecondaryMetrics || "-"}

Guardrail metrics:
${a.edGuardrails || "-"}

Risks:
${a.edRisks || "-"}

Dependencies:
${a.edDependencies || "-"}

Timeline:
${a.edTimeline || "-"}

Open questions:
${a.edOpenQuestions || "-"}
`.trim();
  }

  // =========================
  // GTM – Go-To-Market Plan
  // =========================
  if (docType === "gtm") {
    return `
You are helping a product team write a Go-To-Market (GTM) plan document for a feature or product launch.

This document has TWO main parts:
Part 1: Go-To-Market Strategy (a summary table)
Part 2: Production Checklist (an activities tracker table)

Style guidelines:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting, except for Markdown tables.
- Practical, action-oriented. Each row should make it clear what, who, and when.
- Follow good capitalization: titles capitalised, sentences start with capital letters.
- Never refer to yourself as an assistant or AI.
- Keep proper nouns and acronyms unchanged.

Structure the final GTM plan exactly like this:

Go-To-Market Strategy

Create a Markdown table with two columns: Category and Details.
Include the following rows (use the raw input to fill them):

| Category | Details |
|----------|---------|
| Objective | <what the launch aims to achieve, customer-side and business-side> |
| Use Case | <what the customer will see or experience> |
| Timeline | <key dates or phases, or TBD if unknown> |
| Location / Users | <audience segmentation per phase, e.g. Alpha: internal users, Production: specific area → nationwide> |
| In-App Experience | <description of the new customer-facing experience> |
| Variants | <Control vs Treatment descriptions> |
| Marketing | <Alpha: internal channels. Production: CRM, comms, push strategy> |
| Product Development | <what is being built or changed> |
| Component | <key UI/technical components involved> |
| Inventory | <how inventory or catalog is managed for this launch> |
| Metrics / Goals | <primary success metrics, e.g. ATC%, page visits, CTR> |
| Health Metrics | <guardrail metrics, e.g. system stability, no critical bugs> |
| Operational Requirements | <ops readiness items, e.g. CMS setup, assets ready> |
| Key Risks | <top risks and potential failure modes> |
| Pre-requisites | <what must be true before launch> |
| Success Metrics and Criteria to Progress | <criteria for moving from Alpha → Production, and final success criteria> |

Production Checklist

Create a Markdown table with the following columns: Activities, Details, PIC, ETA, Status, Ref.

Populate the rows based on the raw input. Typical activities include:
- Testing completed (P0/P1 bugs fixed, core journey tested)
- Deployment Backend ready
- Deployment Frontend ready (Android, iOS)
- Asset preparation ready
- Component set up ready
- Experiment / Litmus set up ready
- CMS set up for Control vs Treatment behavior
- Start on Alpha
- Start the experiment
- Communicate with customers to update app
- Conclude experiment
- Gather post-evaluation feedback

For each row:
- Details = specific sub-tasks or criteria as bullet points
- PIC = responsible team or person (e.g. QA Team, Engineer team, Product Team, Ops team, Design team, CRM Team, Researchers)
- ETA = target date or TBD
- Status = Done, In Progress, Backlog, or TBD
- Ref = links or references if available, otherwise "-"

If some details are missing from the raw input, use "TBD" for timeline/status and "-" for empty fields. Do NOT invent fake data.

Use the raw notes below to fill both sections.

RAW INPUT

Objective:
${a.gtmObjective || "-"}

Success Metrics:
${a.gtmSuccessMetrics || "-"}

Rollout Principles:
${a.gtmRolloutPrinciples || "-"}

Milestones and Customer Experience:
${a.gtmMilestones || "-"}

Production Checklist:
${a.gtmProductionChecklist || "-"}

Rollout Strategy:
${a.gtmRolloutStrategy || "-"}

Open Items / Decisions Needed:
${a.gtmOpenItems || "-"}

User Experience (Functional Checklist):
${a.gtmUxChecklist || "-"}

Operational Journey (Functional Checklist):
${a.gtmOpsChecklist || "-"}

Clickstream Requirements:
${a.gtmClickstream || "-"}

Evaluation and Measurement:
${a.gtmEvaluation || "-"}
`.trim();
  }

  // Fallback
  return "Unknown doc type.";
}

// System prompt shared across all doc types
export const SYSTEM_PROMPT = `
You are Franky's personal documentation assistant.

Your job:
Turn rough, shorthand notes into clean, structured documents in Franky's voice
that are ready to share with stakeholders (Eng, Design, BI, leads, etc.).

Franky's style:
- Clear, concise, and practical
- Product-thinking first: problem → context → impact
- Uses metrics (ATC%, CTR, CVR) when mentioned
- Short paragraphs, smart bullet points
- No buzzwords or fluff
- Sounds like a senior PM, not textbook

Rules:
- Do NOT use '#' headings.
- Do NOT use '*' or '**' for bold.
- Use only normal text, line breaks, and '- ' for bullet points.
- No code fences, no markup.
- Do NOT invent fake metrics or facts.
- Keep vague items as TBD.
- Output clean plain text only.
`.trim();
