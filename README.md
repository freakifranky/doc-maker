# Doc Maker v2

Turn rough PM notes into polished product documents — powered by Claude.

## Document Types

- **PRD** – Product Requirements Document
- **MoM** – Minutes of Meeting
- **One-Pager** – Product Brief
- **Experiment Summary** – Post-Experiment Review
- **Experiment Design** – Pre-Experiment Plan
- **GTM** – Go-To-Market Plan

## Stack

- **Frontend**: Next.js 15 (App Router)
- **API**: Anthropic Claude (claude-sonnet-4-20250514)
- **Hosting**: Vercel

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Add the environment variable:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
4. Deploy. That's it.

## Local Development

npm install
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
npm run dev

Open http://localhost:3000.

---

Vibe-coded by @frnkygabriel
