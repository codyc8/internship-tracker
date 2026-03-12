import { dbRun, dbAll } from '../db.js';

/**
 * Deduplicates jobs in database
 * Same company + similar title + similar location = same job
 */
export async function deduplicateJobs() {
  console.log('🔄 Running deduplication...');

  // Find duplicate URLs
  const duplicateUrls = await dbAll(`
    SELECT url, COUNT(*) as count FROM jobs 
    WHERE url IS NOT NULL
    GROUP BY url 
    HAVING count > 1
  `);

  console.log(`Found ${duplicateUrls.length} duplicate URLs`);

  let deletedCount = 0;

  for (const dup of duplicateUrls) {
    // Keep the first one, delete the rest
    const toDelete = await dbAll(`
      SELECT id FROM jobs WHERE url = ? ORDER BY created_at ASC LIMIT 1 OFFSET 1
    `, [dup.url]);

    for (const job of toDelete) {
      await dbRun(`DELETE FROM jobs WHERE id = ?`, [job.id]);
      deletedCount++;
    }
  }

  // Find fuzzy duplicates (same company + similar title, different source)
  const fuzzyDups = await dbAll(`
    SELECT company, title FROM jobs 
    GROUP BY company, title 
    HAVING COUNT(*) > 1
    LIMIT 100
  `);

  console.log(`Found ${fuzzyDups.length} fuzzy duplicates (same company + title)`);

  for (const dup of fuzzyDups) {
    const jobs = await dbAll(`
      SELECT id FROM jobs 
      WHERE company = ? AND title = ? 
      ORDER BY created_at DESC 
      LIMIT 1 OFFSET 1
    `, [dup.company, dup.title]);

    for (const job of jobs) {
      await dbRun(`DELETE FROM jobs WHERE id = ?`, [job.id]);
      deletedCount++;
    }
  }

  console.log(`✅ Deduplication complete: Deleted ${deletedCount} duplicate jobs`);
  return deletedCount;
}

/**
 * Prioritizes jobs by location preference
 * Remote > California > Rest of USA
 */
export async function prioritizeByLocation() {
  console.log('📍 Prioritizing by location...');

  // Add location_priority column if not exists
  try {
    await dbRun(`ALTER TABLE jobs ADD COLUMN location_priority INTEGER DEFAULT 0`);
  } catch (e) {
    // Column likely exists, ignore
  }

  // Remote jobs: priority 10
  await dbRun(`
    UPDATE jobs 
    SET location_priority = 10 
    WHERE location LIKE '%remote%' OR location LIKE '%remote%'
  `);

  // California jobs: priority 5
  await dbRun(`
    UPDATE jobs 
    SET location_priority = 5 
    WHERE location LIKE '%california%' 
      OR location LIKE '%CA%' 
      OR location LIKE '%San Francisco%'
      OR location LIKE '%Los Angeles%'
      OR location LIKE '%San Diego%'
      OR location LIKE '%Palo Alto%'
      OR location LIKE '%Mountain View%'
  `);

  // Nearby states (WA, OR, NV, AZ): priority 3
  await dbRun(`
    UPDATE jobs 
    SET location_priority = 3 
    WHERE location LIKE '%Washington%' 
      OR location LIKE '%WA%'
      OR location LIKE '%Oregon%'
      OR location LIKE '%Nevada%'
      OR location LIKE '%Arizona%'
      OR location LIKE '%Colorado%'
      OR location LIKE '%Texas%'
  `);

  // Rest of USA: priority 1 (default)

  console.log('✅ Location prioritization complete');
}

/**
 * Filter jobs to top 400-500 for manual application
 */
export async function getTopRecommendations(limit = 400) {
  const jobs = await dbAll(`
    SELECT * FROM jobs 
    WHERE match_score IS NOT NULL OR match_score = 0
    ORDER BY 
      match_score DESC,
      location_priority DESC,
      posted_date DESC
    LIMIT ?
  `, [limit]);

  return jobs;
}
