const fs = require('fs');

// Build sidebar from index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
const sidebarMatch = indexHtml.match(/<aside class="sidebar">[\s\S]*?<\/aside>/);
let sidebar = sidebarMatch ? sidebarMatch[0] : '';

if (!sidebar) {
    console.log("ERROR: Could not find sidebar in index.html");
    process.exit(1);
}
console.log("Sidebar found, length:", sidebar.length);

const skipFiles = ['index.html','admin.html','lifestyle.html','technology.html','entertainment.html','health.html','travel.html','business.html','fashion.html','food.html','trending-news.html','our-story.html','contact.html','advertise.html','privacy-policy.html','about-us.html'];
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && !skipFiles.includes(f));

let updated = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('article-layout')) return;

    // Use regex to handle any whitespace
    content = content.replace(
        /(<main class="container">)\s*(<article>)/,
        '$1\n  <div class="article-layout">\n  <div class="article-main">\n  $2'
    );

    // Close the wrappers after first </article> and add sidebar before </main>
    content = content.replace(
        /(<\/article>)\s*(<\/main>)/,
        '$1\n  </div>\n  ' + sidebar + '\n  </div>\n  $2'
    );

    fs.writeFileSync(file, content);
    updated++;
});

// Add CSS
let css = fs.readFileSync('style.css', 'utf8');
if (!css.includes('.article-layout')) {
    css += `
/* Article Page Sidebar Layout */
.article-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  align-items: start;
}
.article-layout .sidebar {
  position: sticky;
  top: 20px;
  align-self: start;
}
.article-main {
  min-width: 0;
}
@media (max-width: 992px) {
  .article-layout {
    grid-template-columns: 1fr;
  }
}
`;
    fs.writeFileSync('style.css', css);
    console.log("Added CSS");
}

console.log('Added sidebar to ' + updated + ' article pages');
