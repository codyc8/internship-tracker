import { compareSkills } from '../parsers/resume-parser.js';
import { dbAll, dbRun } from '../db.js';

export async function scoreAllJobs(userResume) {
  if (!userResume || !userResume.skills) {
    console.log('No resume provided, skipping job scoring');
    return;
  }

  // Get all unseen jobs
  const jobs = await dbAll(`SELECT id, description FROM jobs WHERE seen = 0`);

  console.log(`Scoring ${jobs.length} jobs against resume...`);

  for (const job of jobs) {
    try {
      const score = compareSkills(userResume.skills, job.description || '');
      
      // Update job with score
      await dbRun(
        `UPDATE jobs SET match_score = ?, matched_skills = ? WHERE id = ?`,
        [score.match_percentage, score.matched_skills, job.id]
      );
    } catch (e) {
      console.error(`Error scoring job ${job.id}:`, e);
    }
  }

  console.log('✅ Job scoring complete');
}

export async function getRecommendedJobs(limit = 10) {
  // Return top matches sorted by score
  const jobs = await dbAll(`
    SELECT * FROM jobs 
    WHERE match_score IS NOT NULL
    ORDER BY match_score DESC 
    LIMIT ?
  `, [limit]);

  return jobs;
}

export async function deduplicateJobs() {
  // Find duplicate jobs (same company + similar title)
  const duplicates = await dbAll(`
    SELECT id, company, title, url FROM jobs 
    WHERE id IN (
      SELECT MAX(id) FROM jobs 
      GROUP BY company, title 
      HAVING COUNT(*) > 1
    )
  `);

  console.log(`Found ${duplicates.length} potential duplicates`);
  return duplicates;
}
