const fs = require('fs');

let indexContent = fs.readFileSync('index.html', 'utf8');

// Remove existing anchors
indexContent = indexContent.replace(/<!-- NEW_ARTICLE_ANCHOR -->/g, '');
indexContent = indexContent.replace(/<!-- NEW_TRENDING_ANCHOR -->/g, '');

// Insert NEW_ARTICLE_ANCHOR at the top of the Featured Articles grid
indexContent = indexContent.replace('<h2 class="section-title">Featured Articles</h2>\n        <div class="post-grid" id="latest-articles-grid">', 
    '<h2 class="section-title">Featured Articles</h2>\n        <div class="post-grid" id="latest-articles-grid">\n          <!-- NEW_ARTICLE_ANCHOR -->');

// Insert NEW_TRENDING_ANCHOR at the top of the trending list
indexContent = indexContent.replace('<ul class="trending-list">', 
    '<ul class="trending-list">\n            <!-- NEW_TRENDING_ANCHOR -->');

fs.writeFileSync('index.html', indexContent);

let adminContent = fs.readFileSync('admin.html', 'utf8');
adminContent = adminContent.replace('</article>\n            <!-- NEW_ARTICLE_ANCHOR -->', '<!-- NEW_ARTICLE_ANCHOR -->\n            <article class="post-card">').replace('<article class="post-card">', '');
// Wait, I should do a safer regex replacement in admin.html:
adminContent = adminContent.replace('</div>\n              </article>\n            <!-- NEW_ARTICLE_ANCHOR -->`;', '</div>\n              </article>`;\n\nconst cardHtml = `<!-- NEW_ARTICLE_ANCHOR -->\n` + cardHtmlTemp; // Let\'s just rewrite admin.html safely');

fs.writeFileSync('admin.html', adminContent);
console.log('Fixed anchors');
