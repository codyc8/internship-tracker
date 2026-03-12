import puppeteer from 'puppeteer';
import { dbRun } from '../db.js';

export async function scrapeWellfound() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const searchUrl = 'https://wellfound.com/jobs?job_type=internship&experience_level=intern&role=software_engineer';
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const jobs = await page.evaluate(() => {
      const jobCards = document.querySelectorAll('[class*="JobCard"]');
      const results = [];

      jobCards.forEach(card => {
        try {
          const title = card.querySelector('h2, [class*="title"]')?.textContent.trim();
          const company = card.querySelector('[class*="company"]')?.textContent.trim();
          const location = card.querySelector('[class*="location"]')?.textContent.trim();
          const salary = card.querySelector('[class*="salary"]')?.textContent.trim();
          const description = card.textContent.substring(0, 500).trim();
          const jobUrl = card.querySelector('a')?.href;

          if (title && company && jobUrl) {
            results.push({
              title,
              company,
              location,
              salary: salary || null,
              description,
              url: jobUrl,
              source: 'wellfound',
              posted_date: new Date().toISOString().split('T')[0]
            });
          }
        } catch (e) {
          // Skip on parse error
        }
      });

      return results;
    });

    // Save to database
    for (const job of jobs) {
      try {
        await dbRun(
          `INSERT OR IGNORE INTO jobs (title, company, location, url, source, posted_date, description)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [job.title, job.company, job.location, job.url, job.source, job.posted_date, job.description]
        );
      } catch (e) {
        console.error('Error saving job:', e);
      }
    }

    console.log(`✅ Wellfound scraper: Found ${jobs.length} jobs`);
    return jobs.length;
  } catch (error) {
    console.error('❌ Wellfound scraper error:', error);
    return 0;
  } finally {
    await browser.close();
  }
}
