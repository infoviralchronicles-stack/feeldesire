const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Extract all post cards
const cardRegex = /<article class="post-card">[\s\S]*?<\/article>/g;
let match;
const allCards = [];
while ((match = cardRegex.exec(html)) !== null) {
    // Only push if it's unique (avoid duplicates since we might have them in different sections)
    if (!allCards.includes(match[0])) {
        allCards.push(match[0]);
    }
}

// Categorize them
const categories = {
    lifestyle: [],
    technology: [],
    other: []
};

allCards.forEach(card => {
    if (card.includes('Lifestyle</a>')) categories.lifestyle.push(card);
    else if (card.includes('Technology</a>')) categories.technology.push(card);
    else categories.other.push(card);
});

// Build the new sections
const newSections = `
        <!-- Section 1: Hero & Latest -->
        <section>
          <h2 class="section-title">Latest & Trending</h2>
          <div class="post-grid" id="latest-articles-grid">
            <!-- NEW_ARTICLE_ANCHOR -->
            ${allCards.slice(0, 4).join('\n')}
          </div>
        </section>

        <!-- Section 2: Technology Focus (Dark Theme) -->
        <section class="section-dark">
          <h2 class="section-title">Technology Hub</h2>
          <div class="post-grid">
            ${categories.technology.slice(0, 3).join('\n')}
          </div>
        </section>

        <!-- Section 3: Lifestyle Layout (List View) -->
        <section style="margin-top: 50px;">
          <h2 class="section-title">Lifestyle & Wellness</h2>
          <div class="list-layout">
            ${categories.lifestyle.slice(0, 3).join('\n')}
          </div>
        </section>

        <!-- Section 4: Entertainment -->
        <section style="margin-top: 50px;">
          <h2 class="section-title">Entertainment</h2>
          <div class="hero-grid">
            ${categories.other.slice(0, 4).join('\n')}
          </div>
        </section>
`;

// Replace the main-content inner HTML
const mainContentRegex = /(<div class="content-area">)[\s\S]*?(<\/div>\s*<!-- Right Column: Sidebar -->\s*<aside class="sidebar">)/;
html = html.replace(mainContentRegex, `$1\n${newSections}\n$2`);

fs.writeFileSync('index.html', html);
console.log('Homepage redesigned successfully!');


