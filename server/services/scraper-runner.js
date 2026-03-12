import { scrapeIndeed } from '../scrapers/indeed-scraper.js';
import { scrapeWellfound } from '../scrapers/wellfound-scraper.js';
import { scrapeCompanyPages } from '../scrapers/company-scraper.js';
import { scrapeBroadSources, scrapeLinkedInInternships } from '../scrapers/broad-search-scraper.js';
import { deduplicateJobs, prioritizeByLocation } from './dedup-service.js';
import { dbAll } from '../db.js';

export async function runAllScrapers() {
  console.log('🚀 Starting comprehensive job scraping...');
  const startTime = Date.now();

  let results = {
    indeed: 0,
    wellfound: 0,
    company_pages: 0,
    broad_sources: 0,
    linkedin: 0,
    total: 0,
    duplicates_removed: 0
  };

  // Tier 1: Major Job Boards
  try {
    console.log('📍 [1/5] Scraping Indeed (nationwide)...');
    results.indeed = await scrapeIndeed('USA');
  } catch (e) {
    console.error('❌ Indeed scraper failed:', e);
  }

  try {
    console.log('📍 [2/5] Scraping Wellfound (startups)...');
    results.wellfound = await scrapeWellfound();
  } catch (e) {
    console.error('❌ Wellfound scraper failed:', e);
  }

  // Tier 2: Broad Job Boards
  try {
    console.log('📍 [3/5] Scraping broad sources (AngelList, GitHub, RemoteOK, etc)...');
    results.broad_sources = await scrapeBroadSources();
  } catch (e) {
    console.error('❌ Broad scraper failed:', e);
  }

  try {
    console.log('📍 [4/5] Scraping LinkedIn internships...');
    results.linkedin = await scrapeLinkedInInternships();
  } catch (e) {
    console.error('❌ LinkedIn scraper failed:', e);
  }

  // Tier 3: Company Pages
  try {
    console.log('📍 [5/5] Scraping company career pages (top 20)...');
    results.company_pages = await scrapeCompanyPages();
  } catch (e) {
    console.error('❌ Company scraper failed:', e);
  }

  // Post-processing
  try {
    console.log('🔄 Deduplicating jobs across sources...');
    results.duplicates_removed = await deduplicateJobs();
  } catch (e) {
    console.error('⚠️ Deduplication warning:', e);
  }

  try {
    console.log('📍 Prioritizing by location (Remote > CA > USA)...');
    await prioritizeByLocation();
  } catch (e) {
    console.error('⚠️ Location prioritization warning:', e);
  }

  results.total = results.indeed + results.wellfound + results.company_pages + results.broad_sources + results.linkedin;
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`
✅ SCRAPING COMPLETE!
  Indeed: ${results.indeed} jobs
  Wellfound: ${results.wellfound} jobs
  Broad sources: ${results.broad_sources} jobs
  LinkedIn: ${results.linkedin} jobs
  Company pages: ${results.company_pages} jobs
  ─────────────────────
  Total found: ${results.total} jobs
  Duplicates removed: ${results.duplicates_removed}
  Time: ${duration}s
  `);

  return results;
}

export async function getJobStats() {
  const total = await dbAll(`SELECT COUNT(*) as count FROM jobs`);
  const unseen = await dbAll(`SELECT COUNT(*) as count FROM jobs WHERE seen = 0`);
  const withScore = await dbAll(`SELECT COUNT(*) as count FROM jobs WHERE match_score IS NOT NULL`);
  const topRecommendations = await dbAll(`
    SELECT COUNT(*) as count FROM jobs 
    WHERE match_score IS NOT NULL 
    ORDER BY match_score DESC, location_priority DESC 
    LIMIT 400
  `);

  return {
    total: total[0]?.count || 0,
    unseen: unseen[0]?.count || 0,
    scored: withScore[0]?.count || 0,
    top_400_recommendations: topRecommendations[0]?.count || 0
  };
}
