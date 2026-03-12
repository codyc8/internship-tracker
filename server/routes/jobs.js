import { Router } from 'express';
import { dbAll, dbRun } from '../db.js';
import { getRecommendedJobs } from '../services/job-matcher.js';
import { runAllScrapers, getJobStats } from '../services/scraper-runner.js';

export const jobsRouter = Router();

// Get all unseen jobs
jobsRouter.get('/', async (req, res) => {
  try {
    const jobs = await dbAll(`
      SELECT * FROM jobs WHERE seen = 0 ORDER BY posted_date DESC LIMIT 50
    `);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recommended jobs (high match score)
jobsRouter.get('/recommended', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const jobs = await getRecommendedJobs(parseInt(limit));
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark job as seen
jobsRouter.post('/:id/seen', async (req, res) => {
  try {
    await dbRun(`UPDATE jobs SET seen = 1 WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get stats
jobsRouter.get('/stats/summary', async (req, res) => {
  try {
    const stats = await getJobStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger scraping (admin endpoint)
jobsRouter.post('/scrape/run', async (req, res) => {
  try {
    const results = await runAllScrapers();
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
