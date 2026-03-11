# Internship Tracker

Automate your internship application process. Track applications, get new job listings, and monitor your progress.

## Features

- 📊 **Dashboard** — overview of all applications with conversion rates
- 📋 **Job Feed** — new listings matched to your criteria
- ✅ **Quick Apply** — add applications with one click
- 📈 **Stats** — track interview, offer, and rejection rates
- 🔄 **AI Integration** — chat with me directly in the app for resume help, job analysis, etc.

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Backend:** Node.js + Express + SQLite
- **Job Scraping:** Puppeteer (for LinkedIn, AngelList, etc.)

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Install

```bash
npm install
cd frontend && npm install && cd ..
```

### Run

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:3001`
- Frontend on `http://localhost:5173`

### Build

```bash
npm run build
```

## How It Works

1. **Add Applications** — manually track companies you've applied to
2. **Job Feed** — see new listings matched to your criteria (auto-scraped daily)
3. **Quick Apply** — apply in the tracker and get an application number
4. **Chat with Klawbi** — ask me to tailor your resume, analyze job postings, etc.
5. **Track Progress** — see conversion rates, upcoming interviews, offers

## Database

SQLite database at `/data/tracker.db` with tables:
- `applications` — your applications
- `jobs` — scraped job listings
- `resume_versions` — your resume variants

## Next Steps

- Set up job board scraping (LinkedIn, AngelList, company career pages)
- Add resume upload + storage
- Integrate resume tailoring (AI prompt for each job)
- Deploy to production
