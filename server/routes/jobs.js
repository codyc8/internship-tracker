import { Router } from 'express';
import { dbAll, dbRun } from '../db.js';

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
    const unseen = await dbAll(`SELECT COUNT(*) as count FROM jobs WHERE seen = 0`);
    const total = await dbAll(`SELECT COUNT(*) as count FROM jobs`);
    res.json({ unseen: unseen[0].count, total: total[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
