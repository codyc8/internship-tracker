import { Router } from 'express';
import { dbAll } from '../db.js';

export const statsRouter = Router();

// Get application stats
statsRouter.get('/', async (req, res) => {
  try {
    const total = await dbAll(`SELECT COUNT(*) as count FROM applications`);
    const byStatus = await dbAll(`
      SELECT status, COUNT(*) as count FROM applications GROUP BY status
    `);
    const conversionRate = await dbAll(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('interview', 'offer') THEN 1 ELSE 0 END) as positive
      FROM applications
    `);

    const stats = {
      total: total[0].count,
      byStatus: byStatus.reduce((acc, s) => {
        acc[s.status] = s.count;
        return acc;
      }, {}),
      conversionRate: conversionRate[0].total > 0 
        ? (conversionRate[0].positive / conversionRate[0].total * 100).toFixed(2) + '%'
        : '0%'
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
