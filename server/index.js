import express from 'express';
import cors from 'cors';
// import cron from 'node-cron';
import { initDatabase } from './db.js';
import { applicationsRouter } from './routes/applications.js';
import { jobsRouter } from './routes/jobs.js';
import { resumeRouter } from './routes/resume.js';
import { statsRouter } from './routes/stats.js';
import { runAllScrapers } from './services/scraper-runner.js';

const app = express();
const PORT = process.env.PORT || 3099;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://internship-tracker.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());

// Initialize database
await initDatabase();

// Routes
app.use('/api/applications', applicationsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cron disabled — using external scheduler instead
// cron.schedule('0 16 * * *', async () => { ... });

// Skip scrapers on startup — run via cron or API endpoint instead
// To run manually: POST /api/jobs/scrape/run
console.log('ℹ️  Scrapers skipped on startup (use cron or POST /api/jobs/scrape/run)');

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📅 Daily scrapers scheduled for 8 AM PST');
});
