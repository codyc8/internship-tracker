# Internship Tracker 🚀

Automate your internship application process with AI-powered job matching, resume analysis, and daily job scraping.

## Features

### Core Features
- 📊 **Dashboard** — overview of all applications with conversion rates
- 📄 **Resume Upload** — upload & analyze your resume to extract skills
- 🎯 **Top Job Matches** — see jobs ranked by skill match (80% match, 65% match, etc.)
- 📋 **Job Feed** — browse all scraped internship listings
- ✅ **Application Tracking** — track status of every application (applied → interview → offer)
- 📈 **Stats** — track interview rate, offer rate, and conversion metrics

### Smart Features
- 🤖 **AI Job Matching** — skill-based scoring across 15+ job sources
- 🔄 **Auto Job Scraping** — runs daily at 8 AM PST from 20+ companies
- 💾 **Resume Variants** — save multiple resume versions and score differently
- 🌍 **Multi-Source** — scrapes Indeed, Wellfound, company career pages, and more

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Backend:** Node.js + Express + SQLite
- **Job Scraping:** Puppeteer (handles JS-heavy sites)
- **NLP:** spaCy (skill extraction + matching)
- **Automation:** Node Cron (daily job scraper scheduling)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
cd frontend && npm install && cd ..
```

### Development

Start both frontend + backend:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Manual Job Scraping

Run scrapers on-demand:
```bash
npm run scrape
```

## How to Use

### 1. Upload Your Resume
- Go to **Resume** tab
- Paste your resume as plain text
- We extract: Python, React, ML, Docker, etc.
- All jobs get scored automatically

### 2. View Top Matches
- Go to **Top Job Matches** tab
- See jobs ranked by skill fit (80% match = 8/10 skills found)
- Click "View Job" or "Apply Now"

### 3. Track Applications
- Go to **Add Application** to manually log applications
- Go to **Dashboard** to see conversion rates and progress

### 4. (Coming Soon) Resume Tailoring
- Create "Backend-Focused" or "AI-Focused" resume variants
- Tailor each for different job types
- Different jobs get scored against different resume versions

## Job Sources

The scraper automatically fetches from:

**Top Companies (20):**
- Microsoft, Apple, Amazon, Goldman Sachs, JPMorgan Chase
- Stripe, Notion, Figma, Canva, Databricks
- Chime, Rippling, Scale AI, Anthropic, OpenAI
- Hugging Face, Anduril, Superhuman, Retool, Webflow

**Job Boards:**
- Indeed (California + nationwide)
- Wellfound (startups + remote)
- Company career pages (Greenhouse, Lever, custom)

**Scheduling:**
- Runs daily at 8 AM PST
- Updates database automatically
- Re-scores all new jobs against your resume

## Database

SQLite database at `/data/tracker.db`:
- `applications` — your applications (company, role, status, dates)
- `jobs` — scraped job listings (title, company, skills, match_score)
- `resume_versions` — your resume variants

## Architecture

```
frontend/
├── Dashboard      → applications table + stats
├── Resume Upload  → paste resume → extract skills
├── Top Matches    → jobs ranked by skill match %
└── Job Feed       → all scraped jobs

server/
├── routes/        → REST API endpoints
├── scrapers/      → Indeed, Wellfound, Company pages
├── parsers/       → resume + job description parsing
├── services/      → job matching + scoring
└── cli/           → manual scraper runner
```

## API Endpoints

```
GET  /api/applications          → list all applications
POST /api/applications          → add new application
PUT  /api/applications/:id      → update application
DELETE /api/applications/:id    → delete application

GET  /api/jobs                  → list all unseen jobs
GET  /api/jobs/recommended      → top matching jobs
POST /api/jobs/:id/seen         → mark job as seen
POST /api/jobs/scrape/run       → trigger scraping

POST /api/resume                → upload + analyze resume
GET  /api/resume                → list resume versions
PUT  /api/resume/:id            → update resume

GET  /api/stats                 → application stats
```

## Deployment

### Frontend (Vercel)
Already deployed! https://internship-tracker.vercel.app

Auto-deploys on `git push` to main.

### Backend (Railway/Render)
Instructions in `DEPLOYMENT.md`.

## Development Tips

**Resume Parser:**
- Extracts skills: Python, React, Docker, AWS, etc.
- Extracts experience: company, role, dates
- Extracts education: degree, school, major

**Job Matcher:**
- Counts matched skills vs. total skills
- Calculates match percentage
- Updates database with score

**Scraper:**
- Uses Puppeteer to handle JavaScript-heavy sites
- Inserts jobs only if URL is unique (no duplicates)
- Runs every 24 hours automatically

## Next Steps

1. ✅ Upload your resume
2. ✅ View top job matches
3. ✅ Start applying to recommendations
4. ⏳ (Coming soon) Resume tailoring wizard
5. ⏳ (Coming soon) WhatsApp alerts for new high-match jobs
6. ⏳ (Coming soon) Interview scheduling integration

## Troubleshooting

**Jobs not showing up?**
- Wait a few minutes for initial scraping
- Check `/api/jobs/stats` to see total count
- Resume not uploaded? Upload it first for scoring

**Scraper failing?**
- Check `npm run scrape` logs
- Some sites may have bot protection (we skip those)
- Currently targets 20 major companies + Indeed + Wellfound

**Resume not parsing correctly?**
- Paste as plain text (copy from PDF or LaTeX rendered text)
- Make sure skills are spelled correctly (python, not py; react, not reactjs)

---

Built with ❤️ for ambitious college students applying to 100+ internships. Good luck! 🚀
