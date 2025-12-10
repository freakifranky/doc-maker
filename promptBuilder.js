// promptBuilder.js
// Builds the USER prompt for the LLM based on doc type + raw answers.

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
- You MAY use a simple Markdown table only in the “User Stories” subsection when requested.
- Follow good Indonesian EYD-style capitalization: section titles capitalised, each sentence starts with a capital letter and ends with proper punctuation.
- Never talk about yourself as an assistant or AI. Stay neutral and professional.

Formatting rules for user stories:
- Rewrite the user stories into a Markdown table.
- Columns: No, Scenario, Requirement, Notes.
- Scenario = short description of the situation.
- Requirement = what needs to be true or implemented.
- Notes = extra context, open questions, or assumptions.
- If some details are missing, use "-" instead of inventing them.

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
- Then add a Markdown table with columns: No, Scenario, Requirement, Notes.

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
- Follow good Indonesian EYD-style capitalization: section titles capitalised, sentences start with capital letters and end with proper punctuation.

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
  // One-Pager
  // =========================
  if (docType === "onepager") {
    return `
You are helping a product team write a one-pager (short product brief) that they will share with stakeholders.

Style guidelines:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting.
- Concise, outcome-focused.
- Use numbered headings exactly as defined below.
- Follow good Indonesian/English EYD-style capitalization: titles capitalised, sentences start with capital letters.
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
  // Experiment Summary & Learnings
  // =========================
  if (docType === "experiment") {
    return `
You are helping a team write an experiment summary and learnings document after a test finishes.

Style guidelines:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting.
- Honest, concise, and focused on what we learned and what we will do next.
- Use numbered headings exactly as defined below.
- Follow good Indonesian/English EYD-style capitalization.
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

  // Fallback
  return "Unknown doc type";
}
