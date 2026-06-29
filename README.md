# Scout

AI-powered investment deal screening platform for VC and angel investors. Automates company briefs, thesis matching, and pipeline tracking.

## Architecture

Two components:

- **`scout-app/`** — React + Vite + TypeScript frontend. Kanban board, deal detail views, dashboard, thesis config. Uses the Lemma SDK for auth and real-time data.
- **`scout-pod/`** — Lemma pod backend. 6 agents, 4 functions, 4 tables, 2 workflows that orchestrate the deal research pipeline.

### Pipeline

```
Deal created → deck-extractor → team-researcher → brief-synthesiser → score
                                market-analyst ↗
                                competitive-mapper ↗
```

1. **deck-extractor** — Extracts structured data from uploaded pitch decks
2. **team-researcher** — Researches founding team backgrounds
3. **market-analyst** — Analyzes TAM/SAM/SOM, growth rate, drivers
4. **competitive-mapper** — Maps competitive landscape
5. **brief-synthesiser** — Synthesizes all research into a final brief with risk flags
6. **compute_thesis_score** — Deterministic 0-10 thesis match score

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
    pages/               Route pages (Dashboard, BoardPage, DealPage, etc.)
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
- Pod: `019f0896-0c61-729a-a5a7-6dd1d56e47f6`
- API: `https://api.lemma.work`
- Auth: `https://lemma.work/auth`
