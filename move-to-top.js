const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the iPhone article
const startIdx = html.indexOf('<article class="post-card">\n              <a href="the-ultimate-iPhone');
if (startIdx !== -1) {
    const endIdx = html.indexOf('</article>', startIdx) + '</article>'.length;
    const articleBlock = html.substring(startIdx, endIdx);
    
    // Remove it from its current position
    html = html.substring(0, startIdx) + html.substring(endIdx);
    
    // Also need to find it in the trending list if it's there
    const trendingStartIdx = html.indexOf('<li>\n              <a href="technology.html" class="post-category">Technology</a>\n              <a href="the-ultimate-iPhone-buyer');
    if (trendingStartIdx !== -1) {
        const trendingEndIdx = html.indexOf('</li>', trendingStartIdx) + '</li>'.length;
        const trendingBlock = html.substring(trendingStartIdx, trendingEndIdx);
        html = html.substring(0, trendingStartIdx) + html.substring(trendingEndIdx);
        html = html.replace('<!-- NEW_TRENDING_ANCHOR -->', '<!-- NEW_TRENDING_ANCHOR -->\n            ' + trendingBlock);
    }
    
    // Insert at NEW_ARTICLE_ANCHOR
    html = html.replace('<!-- NEW_ARTICLE_ANCHOR -->', '<!-- NEW_ARTICLE_ANCHOR -->\n            ' + articleBlock);
    
    fs.writeFileSync('index.html', html);
    console.log('Moved iPhone article to top');
} else {
    console.log('iPhone article not found');
}

