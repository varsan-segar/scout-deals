# Scout

AI-powered investment deal screening platform for VC and angel investors. Automates company briefs, thesis matching, and pipeline tracking.

> **New to Scout?** Open the in-app [Guide](scout-app/src/pages/DocsPage.tsx) at `/docs` for a walkthrough of all features, or visit the [GitHub repo](https://github.com/varsan-segar/scout-deals).

## Architecture

Two components:

- **`scout-app/`** — React + Vite + TypeScript frontend. Kanban board, deal detail views, dashboard, thesis config. Uses the Lemma SDK for auth and real-time data.
- **`scout-pod/`** — Lemma pod backend. 9 agents, 5 functions, 4 tables, 2 workflows that orchestrate the deal research pipeline.

### Pipeline

```
intake → convert-deck → deck-extractor ─→ team-researcher → team-synthesiser
                                        ─→ market-analyst → market-synthesiser
                                        ─→ competitive-mapper → competitor-synthesiser
                                                               → brief-synthesiser → score-deal
```

1. **deck-extractor** — Extracts structured data from uploaded pitch decks; creates initial briefs record
2. **team-researcher** — Researches founding team backgrounds via web search
3. **team-synthesiser** — Synthesizes team research into structured founders_json
4. **market-analyst** — Analyzes TAM/SAM/SOM, growth rate, drivers
5. **market-synthesiser** — Synthesizes market research into structured market_json
6. **competitive-mapper** — Maps competitive landscape
7. **competitor-synthesiser** — Synthesizes competitor research into structured competitors_json
8. **brief-synthesiser** — Generates risk flags and aggregates sources
9. **compute_thesis_score** — Deterministic 0-10 thesis match score

### Resources

| Type | Resources |
|---|---|
| **Agents** | `brief-synthesiser`, `competitive-mapper`, `deck-extractor`, `email-extractor`, `market-analyst`, `team-researcher` |
| **Functions** | `compute_thesis_score`, `convert_deck`, `fetch_outlook_message`, `save_email_deal` |
| **Tables** | `deals`, `briefs`, `notes`, `thesis_config` |
| **Workflows** | `deal-research` (5-agent pipeline), `email-intake` (email-based deal intake) |

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Python 3.10+ — for `uv`
- `uv` — `pip install uv` or https://docs.astral.sh/uv/
- Lemma CLI — `uv tool install lemma-terminal`

### App (scout-app)

```bash
cd scout-app
npm install
cp .env.example .env.local
# edit .env.local with your pod ID and API URL
npm run dev
```

### Pod (scout-pod)

```bash
# Select Lemma Cloud server and authenticate
lemma servers cloud --use
lemma auth login

# Create the pod (one-time)
lemma pod create scout-pod --description "AI-powered investment research and deal screening"

# Select and import
lemma pods select scout-pod --save-default
lemma pods import scout-pod
```

> **Environment variables:** Copy `scout-app/.env.example` to `scout-app/.env.local` and fill in your own pod ID, API URL, and auth URL.

### Deploying the App

```bash
cd scout-app
npm run build
lemma apps deploy scout-app --source-dir . --yes
```

## Project Structure

```
scout-app/               React frontend
  src/
    components/          UI components (Deal, Board, Shell)
    pages/               Route pages (Dashboard, BoardPage, DealPage, DocsPage, etc.)
    lib/                 Utilities
    styles/              Global CSS
scout-pod/               Lemma pod backend
  agents/                6 agent definitions + instructions
  functions/             4 Python functions
  workflows/             2 workflow definitions
  tables/                4 table schemas
```

## Lemma Agent Skills

The `.agents/` directory contains IDE agent skills for working with the Lemma platform. Install them with:

```bash
lemma skills install lemma-builder
lemma skills install lemma-user
lemma skills install lemma-widget
```

## Runtime

- App: `scout-app`
- API: `https://api.lemma.work`
- Auth: `https://lemma.work/auth`

> Set your pod ID in `scout-app/.env.local` — see `.env.example`.
