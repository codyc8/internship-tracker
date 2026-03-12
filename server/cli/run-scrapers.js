import { initDatabase } from '../db.js';
import { runAllScrapers, getJobStats } from '../services/scraper-runner.js';

console.log('🚀 Starting job scraping...');

try {
  await initDatabase();
  
  const results = await runAllScrapers();
  const stats = await getJobStats();
  
  console.log('\n📊 Results:');
  console.log(`  Indeed: ${results.indeed} jobs`);
  console.log(`  Wellfound: ${results.wellfound} jobs`);
  console.log(`  Company pages: ${results.company_pages} jobs`);
  console.log(`  Total found: ${results.total}`);
  
  console.log('\n📈 Database stats:');
  console.log(`  Total jobs: ${stats.total}`);
  console.log(`  Unseen: ${stats.unseen}`);
  console.log(`  Scored: ${stats.scored}`);
  
  console.log('\n✅ Scraping complete!');
  process.exit(0);
} catch (error) {
  console.error('❌ Scraping failed:', error);
  process.exit(1);
}
