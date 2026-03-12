import puppeteer from 'puppeteer';
import { dbRun } from '../db.js';

// Top 20 companies still actively recruiting internships in March 2026
// Prioritize companies that frequently hire undergrad interns
const TARGET_COMPANIES = [
  // FAANG + Big Tech
  { name: 'Microsoft', careersUrl: 'https://careers.microsoft.com/us/en/search-results?keywords=intern', location: 'Multiple' },
  { name: 'Apple', careersUrl: 'https://jobs.apple.com/?search=intern', location: 'California' },
  { name: 'Amazon', careersUrl: 'https://amazon.jobs/search?keywords=intern', location: 'Multiple' },
  { name: 'Google', careersUrl: 'https://careers.google.com/jobs?src=Online/Job%20Board/LinkedIn', location: 'California' },
  { name: 'Meta', careersUrl: 'https://www.metacareers.com/jobs/', location: 'California' },
  
  // Finance
  { name: 'Goldman Sachs', careersUrl: 'https://www.goldmansachs.com/careers/students/programs/', location: 'New York' },
  { name: 'JPMorgan Chase', careersUrl: 'https://careers.jpmorgan.com/us/en/students', location: 'New York' },
  
  // Startups (Startup-friendly for interns)
  { name: 'Stripe', careersUrl: 'https://stripe.com/jobs/search?q=intern', location: 'Remote' },
  { name: 'Notion', careersUrl: 'https://www.notion.so/careers', location: 'Remote' },
  { name: 'Figma', careersUrl: 'https://fig.ma/careers', location: 'Remote' },
  { name: 'Canva', careersUrl: 'https://www.canva.com/careers/', location: 'Remote' },
  { name: 'Databricks', careersUrl: 'https://databricks.com/careers', location: 'California' },
  { name: 'Rippling', careersUrl: 'https://www.rippling.com/careers', location: 'California' },
  { name: 'Scale AI', careersUrl: 'https://scale.com/careers', location: 'California' },
  
  // AI/ML Companies
  { name: 'Anthropic', careersUrl: 'https://www.anthropic.com/careers', location: 'California' },
  { name: 'OpenAI', careersUrl: 'https://openai.com/careers', location: 'New York' },
  { name: 'Hugging Face', careersUrl: 'https://huggingface.co/jobs', location: 'Remote' },
  
  // Other Hot Startups
  { name: 'Anduril', careersUrl: 'https://www.anduril.com/careers', location: 'California' },
  { name: 'Retool', careersUrl: 'https://retool.com/careers', location: 'Remote' },
  { name: 'Webflow', careersUrl: 'https://webflow.com/careers', location: 'Remote' }
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
