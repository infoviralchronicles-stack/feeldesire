const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// Regex to extract all post cards
const cardRegex = /<article class="post-card">[\s\S]*?<\/article>/g;
let match;
const categories = {};

while ((match = cardRegex.exec(indexHtml)) !== null) {
    const cardHtml = match[0];
    
    // Extract category name
    const catMatch = cardHtml.match(/class="post-category">([^<]+)<\/a>/);
    if (catMatch) {
        const catName = catMatch[1].trim().toLowerCase().replace(' ', '-'); // e.g. "lifestyle" or "trending-news"
        if (!categories[catName]) {
            categories[catName] = [];
        }
        categories[catName].push(cardHtml);
    }
}

// For each identified category, read the corresponding html file and update its grid
for (const [catName, cards] of Object.entries(categories)) {
    const filename = `${catName}.html`;
    if (fs.existsSync(filename)) {
        let catHtml = fs.readFileSync(filename, 'utf8');
        
        // Find the post-grid div and replace its contents
        const gridRegex = /(<div class="post-grid">)[\s\S]*?(<\/main>)/;
        if (gridRegex.test(catHtml)) {
            const newGridContent = `$1\n${cards.join('\n')}\n</div>\n$2`;
            catHtml = catHtml.replace(gridRegex, newGridContent);
            fs.writeFileSync(filename, catHtml);
            console.log(`Updated ${filename} with ${cards.length} articles.`);
        } else {
            console.log(`post-grid not found in ${filename}`);
        }
    } else {
        console.log(`${filename} does not exist.`);
    }
}
