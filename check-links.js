const fs = require('fs');

const skip = [
  'index.html','admin.html','our-story.html','contact.html',
  'advertise.html','privacy-policy.html','about-us.html',
  'lifestyle.html','technology.html','entertainment.html',
  'health.html','travel.html','business.html','fashion.html',
  'food.html','trending-news.html'
];

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && !skip.includes(f));

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const bodyMatch = content.match(/<div class="article-body">([\s\S]*?)<\/div>/);
  if (bodyMatch) {
    const links = [...bodyMatch[1].matchAll(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)];
    if (links.length) {
      console.log('FILE:', f);
      links.forEach(l => console.log('   link ->', l[1], '| anchor ->', l[2].replace(/\s+/g, ' ').trim()));
    }
  }
});
