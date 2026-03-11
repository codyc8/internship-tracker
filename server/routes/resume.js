import { Router } from 'express';
import { dbRun, dbGet, dbAll } from '../db.js';

export const resumeRouter = Router();

// Get all resume versions
resumeRouter.get('/', async (req, res) => {
  try {
    const versions = await dbAll(`
      SELECT id, name, created_at FROM resume_versions ORDER BY created_at DESC
    `);
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single resume
resumeRouter.get('/:id', async (req, res) => {
  try {
    const resume = await dbGet(`
      SELECT * FROM resume_versions WHERE id = ?
    `, [req.params.id]);
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create resume version
resumeRouter.post('/', async (req, res) => {
  const { name, content } = req.body;
  try {
    const result = await dbRun(`
      INSERT INTO resume_versions (name, content)
      VALUES (?, ?)
    `, [name, content]);
    res.json({ id: result.id, name, created_at: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update resume
resumeRouter.put('/:id', async (req, res) => {
  const { name, content } = req.body;
  try {
    await dbRun(`
      UPDATE resume_versions SET name = ?, content = ? WHERE id = ?
    `, [name, content, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
