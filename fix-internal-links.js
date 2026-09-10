const fs = require('fs');

// Build article list from index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
const cardRegex = /<article class="post-card">\s*<a href="([^"]+)" class="post-img-wrapper">[\s\S]*?<h3 class="post-title">([^<]+)<\/h3>/g;
const articles = [];
let m;
while ((m = cardRegex.exec(indexHtml)) !== null) {
    articles.push({ href: m[1], title: m[2].trim() });
}
console.log(`Found ${articles.length} articles`);

const skipFiles = ['index.html','admin.html','lifestyle.html','technology.html','entertainment.html','health.html','travel.html','business.html','fashion.html','food.html','trending-news.html','our-story.html','contact.html','advertise.html','privacy-policy.html','about-us.html'];
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && !skipFiles.includes(f));

let updated = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Get 2 random OTHER articles for internal linking
    const otherArticles = articles.filter(a => a.href !== file);
    if (otherArticles.length < 2) return;

    const link1 = otherArticles[Math.floor(Math.random() * otherArticles.length)];
    let link2 = otherArticles[Math.floor(Math.random() * otherArticles.length)];
    while (link2.href === link1.href) {
        link2 = otherArticles[Math.floor(Math.random() * otherArticles.length)];
    }

    // Replace the generic category links inside article-body
    // First link: <a href="lifestyle.html">Lifestyle</a>
    // Second link: <a href="technology.html">Technology</a>
    
    // Only replace links inside the article-body div
    const bodyMatch = content.match(/<div class="article-body">([\s\S]*?)<\/div>/);
    if (!bodyMatch) return;

    let body = bodyMatch[1];

    // Replace first internal link (lifestyle.html or technology.html)
    let replaced = 0;
    body = body.replace(/<a href="(lifestyle|technology|entertainment|health|travel|business|fashion|food)\.html">([^<]+)<\/a>/g, (match, page, text) => {
        replaced++;
        if (replaced === 1) {
            return `<a href="${link1.href}" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">${link1.title}</a>`;
        }
        if (replaced === 2) {
            return `<a href="${link2.href}" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">${link2.title}</a>`;
        }
        return match;
    });

    // Also replace "For more insights, check out our..." wrapper text
    body = body.replace(/For more insights, check out our\s*/g, 'You might also enjoy reading ');
    body = body.replace(/Also, explore our\s*/g, 'Discover more in ');
    body = body.replace(/\s*section\./g, '.');
    body = body.replace(/\s*updates for modern trends\./g, '.');

    content = content.replace(bodyMatch[1], body);
    fs.writeFileSync(file, content);
    updated++;
});

// Update the injection logic in single-publish.js and admin.html
// Replace the hardcoded category links with actual article links
const injectionFix = `
    // Get random articles for internal linking
    const idxForLinks = fs.readFileSync('index.html', 'utf8');
    const linkRx = /<a href="([^"]+)"[^>]*><h3 class="post-title">([^<]+)<\\/h3><\\/a>/g;
    const linkArticles = [];
    let lm;
    while ((lm = linkRx.exec(idxForLinks)) !== null) {
        if (lm[1] !== slug + '.html') linkArticles.push({ href: lm[1], title: lm[2] });
    }
    const lnk1 = linkArticles[Math.floor(Math.random() * linkArticles.length)] || { href: 'index.html', title: 'our homepage' };
    const lnk2 = linkArticles[Math.floor(Math.random() * linkArticles.length)] || { href: 'index.html', title: 'trending articles' };
`;

let single = fs.readFileSync('single-publish.js', 'utf8');

// Replace the old hardcoded link injection
single = single.replace(
    /if \(pCount === 1\) append = ' For more insights.*?';/,
    `if (pCount === 1) append = ' You might also enjoy reading <a href="' + lnk1.href + '" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">' + lnk1.title + '</a>.';`
);
single = single.replace(
    /if \(pCount === 3\) append = ' Also, explore.*?';/,
    `if (pCount === 3) append = ' Discover more in <a href="' + lnk2.href + '" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">' + lnk2.title + '</a>.';`
);

// Add the link fetching code before the injection logic
if (!single.includes('Get random articles for internal linking')) {
    single = single.replace('let pCount = 0;', injectionFix + '\n    let pCount = 0;');
}

fs.writeFileSync('single-publish.js', single);

console.log(`Updated internal links in ${updated} articles + single-publish.js`);
