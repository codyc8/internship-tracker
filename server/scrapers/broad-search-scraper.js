import puppeteer from 'puppeteer';
import { dbRun } from '../db.js';

// Search queries for broad internship hunting
const SEARCH_QUERIES = [
  'software engineer internship 2026 summer USA',
  'computer science internship 2026',
  'engineering internship undergraduate 2026',
  'machine learning internship 2026',
  'full stack internship 2026',
  'backend internship 2026',
  'frontend internship 2026',
  'data science internship 2026',
];

const JOB_BOARDS = [
  {
    name: 'AngelList',
    url: 'https://wellfound.com/jobs?job_type=internship&role=software_engineer',
    selectors: {
      jobs: '[class*="JobCard"]',
      title: 'h2, [class*="title"]',
      company: '[class*="company"]',
      url: 'a'
    }
  },
  {
    name: 'GitHub Jobs',
    url: 'https://github.com/search?q=internship+created:>2026-03-01&type=issues',
    selectors: {
      jobs: '[class*="Box-row"]',
      title: 'h3',
      company: '[class*="color-text-secondary"]',
      url: 'a'
    }
  },
  {
    name: 'RemoteOK',
    url: 'https://remoteok.com/remote-internship-jobs',
    selectors: {
      jobs: '[class*="job"]',
      title: 'h2, .title',
      company: '.company',
      url: 'a[href*="/intern"]'
    }
  },
  {
    name: 'We Work Remotely',
    url: 'https://weworkremotely.com/categories/web-back-end-developers#job-listings',
    selectors: {
      jobs: '[class*="feature"]',
      title: 'h2',
      company: '.company',
      url: 'a'
    }
  }
];

export async function scrapeBroadSources() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalJobs = 0;

  for (const board of JOB_BOARDS) {
    try {
      const page = await browser.newPage();
      await page.goto(board.url, { waitUntil: 'domcontentloaded', timeout: 20000 });

      const jobs = await page.evaluate((boardName, selectors) => {
        const jobElements = document.querySelectorAll(selectors.jobs);
        const results = [];

        jobElements.forEach(el => {
          try {
            const titleEl = el.querySelector(selectors.title);
            const companyEl = el.querySelector(selectors.company);
            const urlEl = el.querySelector(selectors.url);

            const title = titleEl?.textContent?.trim();
            const company = companyEl?.textContent?.trim();
            const url = urlEl?.href;

            if (title && url) {
              results.push({
                title,
                company: company || 'Unknown',
                url,
                boardName
              });
            }
          } catch (e) {
            // Skip on error
          }
        });

        return results;
      }, board.name, board.selectors);

      // Save to database
      for (const job of jobs) {
        try {
          await dbRun(
            `INSERT OR IGNORE INTO jobs (title, company, url, source, posted_date)
             VALUES (?, ?, ?, ?, ?)`,
            [job.title, job.company, job.url, board.name.toLowerCase(), new Date().toISOString().split('T')[0]]
          );
          totalJobs++;
        } catch (e) {
          console.error(`Error saving job from ${board.name}:`, e);
        }
      }

      console.log(`✅ ${board.name}: Found ${jobs.length} jobs`);
      await page.close();
    } catch (error) {
      console.error(`❌ Error scraping ${board.name}:`, error);
    }
  }

  await browser.close();
  console.log(`✅ Broad search scraper: Saved ${totalJobs} total jobs`);
  return totalJobs;
}

export async function scrapeLinkedInInternships() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    // LinkedIn internship search for USA
    const searchUrl = 'https://www.linkedin.com/jobs/search/?keywords=internship&locationId=OTHERS.united%20states&f_E=2&pageNum=0';
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const jobs = await page.evaluate(() => {
      const jobCards = document.querySelectorAll('[data-job-id]');
      const results = [];

      jobCards.forEach(card => {
        try {
          const title = card.querySelector('h3')?.textContent?.trim();
          const company = card.querySelector('[data-company-name]')?.textContent?.trim();
          const location = card.querySelector('[data-job-location]')?.textContent?.trim();
          const jobUrl = card.querySelector('a[href*="/jobs/view"]')?.href;

          if (title && jobUrl) {
            results.push({
              title,
              company: company || 'Unknown',
              location,
              url: jobUrl
            });
          }
        } catch (e) {
          // Skip on error
        }
      });

      return results;
    });

    // Save to database
    let savedCount = 0;
    for (const job of jobs) {
      try {
        await dbRun(
          `INSERT OR IGNORE INTO jobs (title, company, location, url, source, posted_date)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [job.title, job.company, job.location, job.url, 'linkedin', new Date().toISOString().split('T')[0]]
        );
        savedCount++;
      } catch (e) {
        console.error('Error saving LinkedIn job:', e);
      }
    }

    console.log(`✅ LinkedIn scraper: Found ${jobs.length} jobs, saved ${savedCount}`);
    return savedCount;
  } catch (error) {
    console.error('❌ LinkedIn scraper error:', error);
    return 0;
  } finally {
    await browser.close();
  }
}
