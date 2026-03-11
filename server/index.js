import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import { applicationsRouter } from './routes/applications.js';
import { jobsRouter } from './routes/jobs.js';
import { resumeRouter } from './routes/resume.js';
import { statsRouter } from './routes/stats.js';

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
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
