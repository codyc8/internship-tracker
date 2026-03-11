import { Router } from 'express';
import { dbRun, dbGet, dbAll } from '../db.js';

export const applicationsRouter = Router();

// Get all applications
applicationsRouter.get('/', async (req, res) => {
  try {
    const apps = await dbAll(`
      SELECT * FROM applications ORDER BY applied_date DESC
    `);
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single application
applicationsRouter.get('/:id', async (req, res) => {
  try {
    const app = await dbGet(`
      SELECT * FROM applications WHERE id = ?
    `, [req.params.id]);
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create application
applicationsRouter.post('/', async (req, res) => {
  const { company, role, status, deadline, notes, resume_version } = req.body;
  try {
    const result = await dbRun(`
      INSERT INTO applications (company, role, status, applied_date, deadline, notes, resume_version)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [company, role, status || 'applied', new Date().toISOString().split('T')[0], deadline, notes, resume_version]);
    res.json({ id: result.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update application
applicationsRouter.put('/:id', async (req, res) => {
  const { company, role, status, deadline, notes } = req.body;
  try {
    await dbRun(`
      UPDATE applications 
      SET company = ?, role = ?, status = ?, deadline = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [company, role, status, deadline, notes, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete application
applicationsRouter.delete('/:id', async (req, res) => {
  try {
    await dbRun(`DELETE FROM applications WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
