import { Router } from 'express';
import { dbRun, dbGet, dbAll } from '../db.js';
import { parseResume } from '../parsers/resume-parser.js';
import { scoreAllJobs } from '../services/job-matcher.js';

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
    // Parse resume to extract skills
    const parsed = parseResume(content);
    
    const result = await dbRun(`
      INSERT INTO resume_versions (name, content)
      VALUES (?, ?)
    `, [name, content]);
    
    // Score all jobs against this resume
    await scoreAllJobs(parsed);
    
    res.json({ 
      id: result.id, 
      name, 
      created_at: new Date().toISOString(),
      skills: parsed.skills
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update resume
resumeRouter.put('/:id', async (req, res) => {
  const { name, content } = req.body;
  try {
    const parsed = parseResume(content);
    
    await dbRun(`
      UPDATE resume_versions SET name = ?, content = ? WHERE id = ?
    `, [name, content, req.params.id]);
    
    // Re-score jobs
    await scoreAllJobs(parsed);
    
    res.json({ success: true, skills: parsed.skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
