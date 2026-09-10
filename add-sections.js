const fs = require('fs');
const path = require('path');

// ---- Step 1: Build a list of all articles from index.html ----
const indexHtml = fs.readFileSync('index.html', 'utf8');

// Extract all article cards: href, image, category, title, author, date, excerpt
const cardRegex = /<article class="post-card">\s*<a href="([^"]+)" class="post-img-wrapper"><img src="([^"]+)"><\/a>\s*<div class="post-content">\s*<a href="[^"]*" class="post-category">([^<]+)<\/a>\s*<a href="[^"]*"><h3 class="post-title">([^<]+)<\/h3><\/a>\s*<div class="post-meta">By <span[^>]*>([^<]+)<\/span>\s*&bull;\s*([^<]+)<\/div>\s*<p class="post-excerpt">([^<]*)<\/p>/g;

const articles = [];
let match;
while ((match = cardRegex.exec(indexHtml)) !== null) {
    articles.push({
        href: match[1],
        image: match[2],
        category: match[3].trim(),
        title: match[4].trim(),
        author: match[5].trim(),
        date: match[6].trim(),
        excerpt: match[7].trim()
    });
}

console.log(`Found ${articles.length} articles in index.html`);

// ---- Step 2: Generate the sections HTML ----
function generateSections(currentSlug, currentCategory) {
    // Related = same category, exclude self, max 3
    const related = articles.filter(a => a.category === currentCategory && a.href !== currentSlug).slice(0, 3);
    // Latest = newest articles (first in list), exclude self, max 4
    const latest = articles.filter(a => a.href !== currentSlug).slice(0, 4);

    function makeCard(a) {
        return `
        <article class="post-card">
          <a href="${a.href}" class="post-img-wrapper"><img src="${a.image}" alt="${a.title}"></a>
          <div class="post-content">
            <a href="${a.category.toLowerCase()}.html" class="post-category">${a.category}</a>
            <a href="${a.href}"><h3 class="post-title">${a.title}</h3></a>
            <div class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">${a.author}</span> &bull; ${a.date}</div>
          </div>
        </article>`;
    }

    let html = '';

    if (related.length > 0) {
        html += `
    <section class="related-articles" style="margin-top: 50px;">
      <div class="container">
        <h2 class="section-title"><span class="tag-box">Related Articles</span></h2>
        <div class="posts-grid">
          ${related.map(makeCard).join('\n')}
        </div>
      </div>
    </section>`;
    }

    html += `
    <section class="latest-articles" style="margin-top: 50px; margin-bottom: 40px;">
      <div class="container">
        <h2 class="section-title"><span class="tag-box">Latest Articles</span></h2>
        <div class="posts-grid">
          ${latest.map(makeCard).join('\n')}
        </div>
      </div>
    </section>`;

    return html;
}

// ---- Step 3: Inject into all article pages ----
const htmlFiles = fs.readdirSync('.').filter(f =>
    f.endsWith('.html') &&
    f !== 'index.html' &&
    f !== 'admin.html' &&
    !['lifestyle.html','technology.html','entertainment.html','health.html','travel.html','business.html','fashion.html','food.html','trending-news.html','our-story.html','contact.html','advertise.html','privacy-policy.html'].includes(f)
);

let updated = 0;
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Skip if already has related/latest
    if (content.includes('related-articles') || content.includes('latest-articles')) return;

    // Find category from the article's meta or matching card
    const articleInfo = articles.find(a => a.href === file);
    const category = articleInfo ? articleInfo.category : 'Technology';

    const sections = generateSections(file, category);

    // Insert before <footer>
    content = content.replace('<footer>', sections + '\n  <footer>');
    fs.writeFileSync(file, content);
    updated++;
});

console.log(`Added Related + Latest sections to ${updated} article pages`);

// ---- Step 4: Update the template in single-publish.js ----
let single = fs.readFileSync('single-publish.js', 'utf8');

// We need to add a dynamic section builder. Since the articles are static HTML,
// we'll use a JS-based approach that loads at runtime via script.js
// Actually, let's inject the sections at publish time using the index.html data

// Add a function after the articleHtml write that reads index and injects sections
const injectCode = `
        // --- Inject Related & Latest Articles ---
        const idxHtml = fs.readFileSync('index.html', 'utf8');
        const cardRx = /<article class="post-card">\\s*<a href="([^"]+)" class="post-img-wrapper"><img src="([^"]+)"><\\/a>\\s*<div class="post-content">\\s*<a href="[^"]*" class="post-category">([^<]+)<\\/a>\\s*<a href="[^"]*"><h3 class="post-title">([^<]+)<\\/h3><\\/a>\\s*<div class="post-meta">By <span[^>]*>([^<]+)<\\/span>\\s*&bull;\\s*([^<]+)<\\/div>\\s*<p class="post-excerpt">([^<]*)<\\/p>/g;
        const allArticles = [];
        let m;
        while ((m = cardRx.exec(idxHtml)) !== null) {
            allArticles.push({ href: m[1], image: m[2], category: m[3].trim(), title: m[4].trim(), author: m[5].trim(), date: m[6].trim() });
        }
        const related = allArticles.filter(a => a.category === data.category && a.href !== slug + '.html').slice(0, 3);
        const latest = allArticles.filter(a => a.href !== slug + '.html').slice(0, 4);
        function mkCard(a) {
            return '<article class="post-card"><a href="' + a.href + '" class="post-img-wrapper"><img src="' + a.image + '"></a><div class="post-content"><a href="' + a.category.toLowerCase() + '.html" class="post-category">' + a.category + '</a><a href="' + a.href + '"><h3 class="post-title">' + a.title + '</h3></a><div class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">' + a.author + '</span> &bull; ' + a.date + '</div></div></article>';
        }
        let sectionsHtml = '';
        if (related.length > 0) {
            sectionsHtml += '<section class="related-articles" style="margin-top:50px;"><div class="container"><h2 class="section-title"><span class="tag-box">Related Articles</span></h2><div class="posts-grid">' + related.map(mkCard).join('') + '</div></div></section>';
        }
        sectionsHtml += '<section class="latest-articles" style="margin-top:50px;margin-bottom:40px;"><div class="container"><h2 class="section-title"><span class="tag-box">Latest Articles</span></h2><div class="posts-grid">' + latest.map(mkCard).join('') + '</div></div></section>';
        
        let finalHtml = fs.readFileSync(slug + '.html', 'utf8');
        finalHtml = finalHtml.replace('<footer>', sectionsHtml + '<footer>');
        fs.writeFileSync(slug + '.html', finalHtml);
`;

// Insert after: fs.writeFileSync(\`\${slug}.html\`, articleHtml);
if (!single.includes('Inject Related')) {
    single = single.replace(
        "fs.writeFileSync(`${slug}.html`, articleHtml);",
        "fs.writeFileSync(`${slug}.html`, articleHtml);\n" + injectCode
    );
    fs.writeFileSync('single-publish.js', single);
    console.log("Updated single-publish.js template with auto Related+Latest injection");
}
