import { scrapeIndeed } from '../scrapers/indeed-scraper.js';
import { scrapeWellfound } from '../scrapers/wellfound-scraper.js';
import { scrapeCompanyPages } from '../scrapers/company-scraper.js';
import { dbAll } from '../db.js';

export async function runAllScrapers() {
  console.log('🚀 Starting daily job scraping...');
  const startTime = Date.now();

  let results = {
    indeed: 0,
    wellfound: 0,
    company_pages: 0,
    total: 0
  };

  try {
    console.log('📍 Scraping Indeed...');
    results.indeed = await scrapeIndeed('California');
  } catch (e) {
    console.error('❌ Indeed scraper failed:', e);
  }

  try {
    console.log('📍 Scraping Wellfound...');
    results.wellfound = await scrapeWellfound();
  } catch (e) {
    console.error('❌ Wellfound scraper failed:', e);
  }

  try {
    console.log('📍 Scraping company pages...');
    results.company_pages = await scrapeCompanyPages();
  } catch (e) {
    console.error('❌ Company scraper failed:', e);
  }

  results.total = results.indeed + results.wellfound + results.company_pages;
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`✅ Scraping complete! Found ${results.total} new jobs in ${duration}s`);
  return results;
}

export async function getJobStats() {
  const total = await dbAll(`SELECT COUNT(*) as count FROM jobs`);
  const unseen = await dbAll(`SELECT COUNT(*) as count FROM jobs WHERE seen = 0`);
  const withScore = await dbAll(`SELECT COUNT(*) as count FROM jobs WHERE match_score IS NOT NULL`);

  return {
    total: total[0].count,
    unseen: unseen[0].count,
    scored: withScore[0].count
  };
}
