import puppeteer from 'puppeteer';
import { dbRun } from '../db.js';

export async function scrapeIndeed(location = 'USA') {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Multiple search queries for comprehensive coverage
    const searchQueries = [
      'software+engineer+internship',
      'computer+science+internship',
      'engineering+internship',
      'machine+learning+internship',
      'full+stack+internship'
    ];

    let totalJobsFound = 0;

    for (const query of searchQueries) {
      const searchUrl = location === 'USA' 
        ? `https://www.indeed.com/jobs?q=${query}&radius=1000&jt=internship&sort=date`
        : `https://www.indeed.com/jobs?q=${query}&l=${encodeURIComponent(location)}&jt=internship&sort=date`;
      
      try {
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        const jobs = await page.evaluate(() => {
          const jobCards = document.querySelectorAll('[data-job-id]');
          const results = [];

          jobCards.forEach(card => {
            try {
              const title = card.querySelector('h2 a')?.textContent?.trim();
              const company = card.querySelector('[data-company-name]')?.textContent?.trim();
              const location = card.querySelector('[data-job-location]')?.textContent?.trim();
              const salary = card.querySelector('.salary-snippet')?.textContent?.trim();
              const summary = card.querySelector('.job-snippet')?.textContent?.trim();
              const jobUrl = card.querySelector('h2 a')?.href;

              if (title && company && jobUrl) {
                results.push({
                  title,
                  company,
                  location,
                  salary: salary || null,
                  description: summary,
                  url: jobUrl,
                  source: 'indeed',
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
              `INSERT OR IGNORE INTO jobs (title, company, location, url, source, posted_date, description, salary)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [job.title, job.company, job.location, job.url, job.source, job.posted_date, job.description, job.salary]
            );
          } catch (e) {
            console.error('Error saving job:', e);
          }
        }

        totalJobsFound += jobs.length;
        console.log(`  [${query}] Found ${jobs.length} jobs`);
      } catch (e) {
        console.error(`  ⚠️ Error with query "${query}":`, e.message);
      }
    }

    console.log(`✅ Indeed scraper: Found ${totalJobsFound} jobs total`);
    return totalJobsFound;
  } catch (error) {
    console.error('❌ Indeed scraper error:', error);
    return 0;
  } finally {
    await browser.close();
  }
}
