# Krystle

**Krystle** is an AI-powered job discovery and application copilot. It continuously finds jobs from public sources, analyzes them against your GitHub profile, resume, and preferences, ranks them with AI, and surfaces only the roles that actually fit you.

Krystle is **human-in-the-loop by design** — it never auto-applies. Every application requires your explicit approval, and the matching engine learns from your feedback over time.

## Who it's for

- Students & interns
- Recent / new graduates
- Software, AI, and ML engineers
- Developer Relations & Solutions Engineers
- Startup job seekers

## Why it exists

Most job platforms recommend irrelevant roles, push senior positions to junior candidates, ignore your feedback, and force you to manually search many job boards. Krystle solves this by aggregating jobs, understanding your real skills, learning your preferences, and requiring approval before anything is applied to.

## Features

- **OAuth login** — GitHub and Google via NextAuth.
- **Onboarding** — guided profile setup (GitHub URL, resume upload, locations, remote preference, desired roles, experience level).
- **GitHub intelligence** — analyzes repos, languages, and topics to infer skills and seniority.
- **Resume intelligence** — parses an uploaded PDF to extract skills, experience, and projects.
- **Modular job connectors** — Greenhouse, Lever, RemoteOK, YC / others (easily extendable).
- **AI matching engine** — scores each job 0–100 with hard filters that reject mismatched senior/manager roles for junior candidates.
- **Human-in-the-loop feed** — jobs bucketed into Recommended / Review / Ignore; you choose Apply, Watchlist, or Ignore.
- **Feedback learning** — your actions adjust future rankings.
- **Application tracking** — Kanban board (Applied → Interview → Assessment → Offer / Rejected).
- **AI Career Coach** — chat panel for skills gaps, recommendations, and "why was this recommended?".

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) + React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui + Framer Motion |
| Backend | Next.js Route Handlers |
| ORM | Prisma 7 (client generated to `src/generated/prisma`) |
| Database | PostgreSQL |
| Auth | NextAuth v4 (GitHub + Google) |
| AI | OpenRouter (via the OpenAI SDK) |

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g. [Neon](https://neon.tech), Supabase, or local Postgres)
- An [OpenRouter](https://openrouter.ai) API key
- GitHub and/or Google OAuth credentials

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

The variables are:

```bash
# --- Database (required) ---
DATABASE_URL="postgresql://user:password@host:5432/krystle?sslmode=require"

# --- NextAuth (required) ---
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"   # set to your real domain in production

# --- OAuth providers (configure at least one) ---
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_ID=""
GOOGLE_SECRET=""

# --- Integrations ---
GITHUB_TOKEN=""          # personal access token used by the GitHub analyzer
OPENROUTER_API_KEY=""    # powers all AI features
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma |
| `NEXTAUTH_SECRET` | Yes | Session encryption secret |
| `NEXTAUTH_URL` | Yes | App origin used for OAuth callbacks |
| `GITHUB_ID` / `GITHUB_SECRET` | One provider | GitHub OAuth app credentials |
| `GOOGLE_ID` / `GOOGLE_SECRET` | One provider | Google OAuth client credentials |
| `GITHUB_TOKEN` | Recommended | Higher GitHub API rate limits for repo analysis |
| `OPENROUTER_API_KEY` | Yes | Job matching, career coach, GitHub & resume analysis |

> OAuth callback URLs should be `http://localhost:3000/api/auth/callback/{github|google}` locally, and `https://your-domain.com/api/auth/callback/{github|google}` in production.

### 3. Set up the database

```bash
# Generate the Prisma client
npx prisma generate

# Create tables (development)
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |

## Project structure

```
.
├── prisma/
│   └── schema.prisma          # Postgres data model
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── api/               # Route handlers
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── jobs/          # Job feed
│   │   │   ├── applications/  # Application tracking
│   │   │   ├── profile/       # Profile CRUD
│   │   │   ├── github/        # GitHub analysis
│   │   │   ├── resume/        # Resume upload/parse
│   │   │   ├── ai/            # Career coach
│   │   │   └── feedback/      # Feedback learning
│   │   ├── dashboard/         # Overview, jobs, applications, coach, profile, onboarding
│   │   └── page.tsx           # Landing page
│   ├── components/            # UI (shadcn) + layout
│   ├── lib/                   # auth, prisma, utils
│   ├── services/              # ai, github, resume, connectors, matching
│   ├── generated/prisma/      # Generated Prisma client
│   └── types/                 # Shared types
└── README.md
```

## Data model

The Prisma schema defines: `User`, `Account`, `Session`, `VerificationToken` (auth), `Profile` (skills, preferences, GitHub/resume analysis), `Job` (with `matchScore`, `category`, `status`), `Application` (tracking status), and `Feedback` (learning signals).

## How matching works

For each job the engine computes a **0–100 match score** from skills overlap, role relevance, and location/remote fit, then applies hard filters (e.g. reject senior/lead/staff/manager roles for student-level candidates). Jobs are bucketed:

- **Recommended** — score > 80
- **Review** — score 60–80
- **Ignore** — score < 60

Your Apply / Watchlist / Ignore actions are recorded as feedback to refine future rankings.

## Deployment (Vercel)

1. Push the repo and import the project into Vercel. The Next.js app is at the
   repository root, so the **Root Directory** can be left as the default (`./`).
2. Add all environment variables from the table above (set `NEXTAUTH_URL` to your
   production domain). Use a managed Postgres such as Neon for `DATABASE_URL`.
3. Deploy.

The build command in `vercel.json` runs on every deploy:

```
prisma generate && prisma db push --accept-data-loss && next build
```

This generates the Prisma client **and applies the schema to your database**, so no
manual migration step is needed. `DATABASE_URL` must be set, or the build will fail.

Authentication uses NextAuth with the Prisma adapter (database sessions). You need
`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and at least one OAuth provider configured — see
[Setting up authentication](#setting-up-authentication) below.

No secrets are hardcoded — everything is read from environment variables.

## Setting up authentication

1. **Generate the session secret:**
   ```bash
   openssl rand -base64 32
   ```
   Use the output as `NEXTAUTH_SECRET`.

2. **Create a GitHub OAuth app** at <https://github.com/settings/developers> →
   *New OAuth App*:
   - Homepage URL: your app URL (e.g. `https://your-app.vercel.app`)
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`
   - Copy the Client ID → `GITHUB_ID` and a generated Client Secret → `GITHUB_SECRET`.

3. **(Optional) Create a Google OAuth client** at
   <https://console.cloud.google.com/apis/credentials> → *Create Credentials → OAuth client ID*:
   - Authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
   - Copy the values into `GOOGLE_ID` / `GOOGLE_SECRET`.

4. **Set `NEXTAUTH_URL`** to your exact app origin (no trailing slash). For local dev
   use `http://localhost:3000` and add `http://localhost:3000/api/auth/callback/github`
   as a second callback URL on the OAuth app.

## Roadmap

- Additional connectors (LinkedIn, Indeed, Wellfound, Apify)
- Telegram daily digest with inline Apply / Watchlist / Ignore actions
- Resume tailoring (ATS + keyword optimization per job)
- Scheduled cron jobs (daily scrape & re-rank, weekly insights)
