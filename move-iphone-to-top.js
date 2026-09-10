const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the iphone article
const startIdx = html.indexOf('<a href="the-ultimate-guide-to-buy-iphone');
if (startIdx !== -1) {
    const articleStart = html.lastIndexOf('<article', startIdx);
    const endIdx = html.indexOf('</article>', startIdx) + '</article>'.length;
    
    if (articleStart !== -1) {
        const articleBlock = html.substring(articleStart, endIdx);
        html = html.substring(0, articleStart) + html.substring(endIdx);
        html = html.replace('<!-- NEW_ARTICLE_ANCHOR -->', '<!-- NEW_ARTICLE_ANCHOR -->\n            ' + articleBlock);
        
        fs.writeFileSync('index.html', html);
        console.log('Moved iPhone article to top');
    }
} else {
    console.log('Not found');
}
