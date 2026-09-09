const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && !['index.html', 'admin.html', 'about-us.html', 'contact.html', 'privacy-policy.html', 'advertise.html', 'our-story.html', 'lifestyle.html', 'entertainment.html', 'technology.html', 'health.html', 'travel.html', 'business.html', 'fashion.html', 'food.html', 'trending-news.html'].includes(f));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Match <div class="article-body"> followed by an <h1> or <h2> tag that might contain the title
  content = content.replace(/(<div class="article-body">\s*)<h[12][^>]*>.*?<\/h[12]>\s*/i, '$1');
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
}
console.log('Done fixing duplicate titles in existing articles.');
