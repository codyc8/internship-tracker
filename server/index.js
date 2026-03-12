import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { initDatabase } from './db.js';
import { applicationsRouter } from './routes/applications.js';
import { jobsRouter } from './routes/jobs.js';
import { resumeRouter } from './routes/resume.js';
import { statsRouter } from './routes/stats.js';
import { runAllScrapers } from './services/scraper-runner.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

// Cron job: Run scrapers daily at 8 AM PST (16:00 UTC)
// Adjust this based on your timezone
cron.schedule('0 16 * * *', async () => {
  console.log('[CRON] Running daily job scrapers...');
  try {
    await runAllScrapers();
  } catch (err) {
    console.error('[CRON] Scraping failed:', err);
  }
});

// Optional: Run scrapers on startup (comment out if not needed)
console.log('🔄 Running initial job scraping...');
try {
  await runAllScrapers();
} catch (err) {
  console.error('⚠️ Initial scraping failed (continuing anyway):', err);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📅 Daily scrapers scheduled for 8 AM PST');
});
