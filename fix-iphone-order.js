const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the iphone article
const iphoneStart = html.indexOf('<a href="the-ultimate-guide-to-buy-iphone');
const articleStart = html.lastIndexOf('<article class="post-card">', iphoneStart);
const articleEnd = html.indexOf('</article>', iphoneStart) + '</article>'.length;
const iphoneBlock = html.substring(articleStart, articleEnd);

// Find the anchor
const anchorIdx = html.indexOf('<!-- NEW_ARTICLE_ANCHOR -->');

// Remove both iphone block and the anchor
html = html.replace(iphoneBlock, '');
html = html.replace('<!-- NEW_ARTICLE_ANCHOR -->', '');

// Put them both right after the grid start
const gridStart = '<div class="post-grid" id="latest-articles-grid">';
html = html.replace(gridStart, gridStart + '\n          <!-- NEW_ARTICLE_ANCHOR -->\n          ' + iphoneBlock);

fs.writeFileSync('index.html', html);
console.log('Fixed exactly!');
