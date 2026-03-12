import puppeteer from 'puppeteer';
import { dbRun } from '../db.js';

// Top 20 companies still actively recruiting internships in March 2026
const TARGET_COMPANIES = [
  { name: 'Microsoft', careersUrl: 'https://careers.microsoft.com/us/en/search-results?keywords=intern' },
  { name: 'Apple', careersUrl: 'https://jobs.apple.com/?search=intern' },
  { name: 'Amazon', careersUrl: 'https://amazon.jobs/search?keywords=intern' },
  { name: 'Goldman Sachs', careersUrl: 'https://www.goldmansachs.com/careers/students/programs/' },
  { name: 'JPMorgan Chase', careersUrl: 'https://careers.jpmorgan.com/us/en/students' },
  { name: 'Stripe', careersUrl: 'https://stripe.com/jobs/search?q=intern' },
  { name: 'Notion', careersUrl: 'https://www.notion.so/careers' },
  { name: 'Figma', careersUrl: 'https://fig.ma/careers' },
  { name: 'Canva', careersUrl: 'https://www.canva.com/careers/' },
  { name: 'Databricks', careersUrl: 'https://databricks.com/careers' },
  { name: 'Chime', careersUrl: 'https://www.chime.com/careers/' },
  { name: 'Rippling', careersUrl: 'https://www.rippling.com/careers' },
  { name: 'Scale AI', careersUrl: 'https://scale.com/careers' },
  { name: 'Anthropic', careersUrl: 'https://www.anthropic.com/careers' },
  { name: 'OpenAI', careersUrl: 'https://openai.com/careers' },
  { name: 'Hugging Face', careersUrl: 'https://huggingface.co/jobs' },
  { name: 'Anduril', careersUrl: 'https://www.anduril.com/careers' },
  { name: 'Superhuman', careersUrl: 'https://superhuman.com/careers' },
  { name: 'Retool', careersUrl: 'https://retool.com/careers' },
  { name: 'Webflow', careersUrl: 'https://webflow.com/careers' }
];

export async function scrapeCompanyPages() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalJobs = 0;

  for (const company of TARGET_COMPANIES) {
    try {
      const page = await browser.newPage();
      await page.goto(company.careersUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

      const jobs = await page.evaluate((companyName) => {
        // Generic selectors that work across most career pages
        const jobElements = document.querySelectorAll(
          '[class*="job"], [class*="position"], [data-job-id], .job-item, .position-item'
        );
        
        const results = [];
        jobElements.forEach(el => {
          try {
            const titleEl = el.querySelector('h2, h3, [class*="title"], [class*="job-title"]');
            const title = titleEl?.textContent.trim();
            
            const locationEl = el.querySelector('[class*="location"], [class*="city"]');
            const location = locationEl?.textContent.trim();
            
            const linkEl = el.querySelector('a[href*="job"], a[href*="position"]');
            const url = linkEl?.href;

            if (title && url) {
              results.push({
                title,
                location: location || null,
                url,
                company: companyName
              });
            }
          } catch (e) {
            // Skip on error
          }
        });

        return results;
      }, company.name);

      // Save to database
      for (const job of jobs) {
        try {
          await dbRun(
            `INSERT OR IGNORE INTO jobs (title, company, location, url, source, posted_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [job.title, job.company, job.location, job.url, 'company_page', new Date().toISOString().split('T')[0]]
          );
          totalJobs++;
        } catch (e) {
          console.error(`Error saving job for ${company.name}:`, e);
        }
      }

      console.log(`✅ ${company.name}: Found ${jobs.length} jobs`);
      await page.close();
    } catch (error) {
      console.error(`❌ Error scraping ${company.name}:`, error);
    }
  }

  await browser.close();
  console.log(`✅ Company pages scraper: Saved ${totalJobs} total jobs`);
  return totalJobs;
}
