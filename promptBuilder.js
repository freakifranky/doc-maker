// promptBuilder.js
// Builds the USER prompt for the LLM based on doc type + raw answers.

export function buildPromptForType(docType, a) {
  // PRD
  if (docType === "prd") {
    return `
You are writing a Product Requirements Document (PRD) that Franky will paste into a doc or Lark.

Style:
- Plain text only. Do NOT use '#' or '*'.
- Short, clear sentences. Product-thinking, no fluff.
- Use numbered section headings like:
  1. Background
  2. Problem Statement
  3. Objective
  4. Success Metrics
  5. Milestones
  6. Milestone Breakdown
  7. Open Items
- Use "-" for bullet points where helpful.

Formatting rules for user stories:
- Rewrite the user stories into a Markdown table.
- Columns: No, Scenario, Requirement, Notes.
- Scenario = short description of the situation.
- Requirement = what needs to be true or implemented.
- Notes = extra context, open questions, or assumptions.
- If some details are missing, use "-" instead of inventing them.

Structure the final PRD exactly like this:

1. Background
- Today: <rewrite and clarify>
- Why now: <rewrite and clarify>

2. Problem Statement
- What is the problem
- Who experiences it (segments, surfaces, flows)

3. Objective
- What we want to achieve and why it matters to users and business

4. Success Metrics
- Primary metrics
- Guardrail metrics
- Any directional or qualitative checks

5. Milestones
- High-level phases or key checkpoints over time

6. Milestone Breakdown
6.1 Objective
- Clarify the objective for this milestone

6.2 Scope
- In-scope items, flows, or components

6.3 Out of Scope
- What is explicitly not included for this iteration

6.4 User Stories
- Use this style:
  - [Px] As a <type of user>, I can <do something> so that <benefit>.
    GIVEN <precondition>,
    WHEN <user action>,
    THEN <expected outcome>.
  - Add Acceptance Criteria as simple bullet points under each relevant story.

6.5 Analytics / Clickstream Requirements
- Group by priority (P0, P1, P2)
- Describe what needs to be tracked and at which level (page, component, event)

6.6 Rollout Strategy
- Phasing (e.g. 10% → 30% → 50% → 70% → 100%)
- Cohorts, markets, or platforms if relevant

6.7 Risks and Mitigation
- Risk: ...
  - Mitigation: ...

7. Open Items
- Questions or dependencies that are still TBD

Use the raw notes below to fill these sections in your own words, while keeping the structure above.

RAW INPUT

Background - Today:
${a.backgroundToday || "-"}

Background - Why now:
${a.backgroundWhyNow || "-"}

Problem statement:
${a.problemStatement || "-"}

Who experiences it:
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

  // MoM
  if (docType === "mom") {
    return `
You are writing meeting notes (MoM) that Franky will paste directly into a Lark chat.

Style:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting.
- Short, clear bullets.
- Use a bracketed title on the first line:
  [MoM - short topic / key phrase]
- Then a blank line.
- Then:
  Meeting notes:
  - bullet
  - bullet
- Then a blank line.
- Then:
  Action Items:
  - Owner / team - action, include outputs or ETA if mentioned
- Then a blank line.
- End with:
  Thanks!

Use the audience only as context (don’t print it as a separate section unless it helps clarify the topic).

AUDIENCE (context only):
${a.audience || "-"}

RAW MEETING NOTES:
${a.meetingNotes || "-"}

RAW ACTION ITEMS:
${a.actionItems || "-"}

Now generate the final MoM in exactly this structure:

[MoM - ...topic...]

Meeting notes:
- ...

Action Items:
- ...

Thanks!
`.trim();
  }

  // One-Pager
  if (docType === "onepager") {
    return `
You are writing a one-pager that Franky will share with stakeholders.

Style:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting.
- Concise, outcome-focused.
- Use numbered headings:
  1. Context
  2. Objective
  3. Success Metrics
  4. Expected Output
  5. Rollout Strategy

Structure the final one-pager like this:

1. Context
- Brief background on what is happening today
- Why this topic matters now (user + business angle)

2. Objective
- Clear statement of what we want to achieve
- How we will know this effort is directionally "working"

3. Success Metrics
- Primary metrics we will look at
- Any guardrails or qualitative checks

4. Expected Output
- What concrete artefacts, changes, or decisions should exist after this work
- How other teams (Eng, Design, BI, Ops) will use the output

5. Rollout Strategy
- Phasing, cohorts, platforms, or markets
- Any high-level communication or enablement notes

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

  // Experiment Summary & Learnings
  if (docType === "experiment") {
    return `
You are writing an experiment summary and learnings document that Franky will share after a test finishes.

Style:
- Plain text only. Do NOT use '#' or '*' or Markdown formatting.
- Honest, concise, and focused on what we learned and what we will do next.
- Use numbered headings:
  1. Context
  2. Hypothesis
  3. Metrics
  4. What Worked
  5. What Didn't Work
  6. Decision
  7. Next Steps
  8. Key Learnings

Structure the final document like this:

1. Context
- Short description of the experiment setup (surface, audience, key variation)
- Why we ran this test now

2. Hypothesis
- Clear, testable statement in plain language

3. Metrics
- Which metrics we looked at (primary, secondary, guardrails)
- High-level outcome in words (e.g. "ATC% moved slightly up, CVR flat")

4. What Worked
- Behaviours, patterns, or signals that looked promising

5. What Didn't Work
- Negative or neutral outcomes, unexpected behaviours, or pitfalls

6. Decision
- Ship, iterate, roll back, or park
- Brief rationale tied to metrics and observations

7. Next Steps
- Concrete follow-ups: new experiments, design tweaks, tech work, or analysis

8. Key Learnings
- 3–5 bullets summarising what we now believe or understand better

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
