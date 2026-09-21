const fs = require('fs');

const allCategorySlugs = [
    'lifestyle',
    'entertainment',
    'technology',
    'health',
    'travel',
    'business',
    'fashion',
    'food',
    'trending-news'
];

const indexHtml = fs.readFileSync('index.html', 'utf8');

// Regex to extract all post cards from index.html
const cardRegex = /<article class="post-card">[\s\S]*?<\/article>/g;
let match;
const categories = {};
for (const slug of allCategorySlugs) {
    categories[slug] = [];
}

while ((match = cardRegex.exec(indexHtml)) !== null) {
    let cardHtml = match[0];
    
    // Ensure author link inside card does not have .html
    cardHtml = cardHtml.replace(/href=["'](author-[^"']+)\.html["']/g, 'href="$1"');

    // Extract category name
    const catMatch = cardHtml.match(/class="post-category">([^<]+)<\/a>/);
    if (catMatch) {
        const catName = catMatch[1].trim().toLowerCase().replace(/\s+/g, '-');
        if (categories[catName]) {
            categories[catName].push(cardHtml);
        }
    }
}

// For each identified category, read the corresponding html file and update its grid
for (const [catName, cards] of Object.entries(categories)) {
    const filename = `${catName}.html`;
    if (fs.existsSync(filename)) {
        let catHtml = fs.readFileSync(filename, 'utf8');
        
        // Find the post-grid div and replace its contents safely
        const gridRegex = /(<div class="post-grid">)[\s\S]*?(<\/div>\s*<\/main>)/;
        if (gridRegex.test(catHtml)) {
            const content = cards.length > 0 
                ? cards.join('\n') 
                : '<div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; color: #64748b;"><p style="font-size: 1.2rem; margin-bottom: 10px;">New stories in this category are coming soon.</p><p style="font-size: 0.95rem;">Stay tuned for expert reviews, guides, and updates.</p></div>';
            catHtml = catHtml.replace(gridRegex, `$1\n${content}\n$2`);
            fs.writeFileSync(filename, catHtml, 'utf8');
            console.log(`Updated ${filename} with ${cards.length} articles.`);
        } else {
            console.log(`post-grid not found in ${filename}`);
        }
    } else {
        console.log(`${filename} does not exist.`);
    }
}
