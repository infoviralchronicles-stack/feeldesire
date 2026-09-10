const fs = require('fs');

// 1. Update single-publish.js
let single = fs.readFileSync('single-publish.js', 'utf8');

// Replace the random link selection logic with relevance scoring
const oldLinkSelection = `    // Get random articles for internal linking
    const idxForLinks = fs.readFileSync('index.html', 'utf8');
    const linkRx = /<a href="([^"]+)"[^>]*><h3 class="post-title">([^<]+)<\\/h3><\\/a>/g;
    const linkArticles = [];
    let lm;
    while ((lm = linkRx.exec(idxForLinks)) !== null) {
        if (lm[1] !== slug + '.html') linkArticles.push({ href: lm[1], title: lm[2] });
    }
    const lnk1 = linkArticles[Math.floor(Math.random() * linkArticles.length)] || { href: 'index.html', title: 'our homepage' };
    const lnk2 = linkArticles[Math.floor(Math.random() * linkArticles.length)] || { href: 'index.html', title: 'trending articles' };`;

const newLinkSelection = `    // Get contextually relevant articles for internal linking
    const idxForLinks = fs.readFileSync('index.html', 'utf8');
    const linkRx = /<article class="post-card">[\\s\\S]*?<a href="([^"]+)" class="post-img-wrapper">[\\s\\S]*?<a href="[^"]*" class="post-category">([^<]+)<\\/a>[\\s\\S]*?<h3 class="post-title">([^<]+)<\\/h3>/g;
    const linkArticles = [];
    let lm;
    while ((lm = linkRx.exec(idxForLinks)) !== null) {
        if (lm[1] !== slug + '.html') {
            linkArticles.push({ href: lm[1], category: lm[2].trim(), title: lm[3].trim() });
        }
    }

    // Score relevance against current keyword/title/category
    const kwTokens = (keyword + ' ' + (data.category || '')).toLowerCase().split(/[\\s,-]+/).filter(w => w.length > 2);
    function scoreArticle(a) {
        let score = 0;
        if (a.category && data.category && a.category.toLowerCase() === data.category.toLowerCase()) score += 5;
        const targetTokens = (a.title + ' ' + a.href).toLowerCase();
        kwTokens.forEach(token => {
            if (targetTokens.includes(token)) score += 3;
        });
        return score;
    }

    linkArticles.sort((a, b) => scoreArticle(b) - scoreArticle(a));
    const lnk1 = linkArticles[0] || { href: 'index.html', title: 'Related Insights' };
    const lnk2 = linkArticles[1] || linkArticles[0] || { href: 'index.html', title: 'Trending Coverage' };`;

if (single.includes('Get random articles for internal linking')) {
    single = single.replace(oldLinkSelection, newLinkSelection);
}

// Ensure the article template in single-publish.js includes the article-layout and sidebar
const oldArticleHtmlStart = `  <main class="container">
    <article>
      <header class="article-header">
        <a href="\${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">\${data.category}</a>
        <h1 class="article-title">\${data.title}</h1>
        <div class="article-meta">By AI Editor | \${dateStr}</div>
      </header>
      <div class="article-featured-image"><img src="\${imageUrl}" alt="\${data.title}"></div>
      <div class="article-body">\${data.htmlContent}</div>
    </article>
  </main>`;

// Read current sidebar from index.html to embed in template
const indexHtml = fs.readFileSync('index.html', 'utf8');
const sidebarMatch = indexHtml.match(/<aside class="sidebar">[\s\S]*?<\/aside>/);
const sidebarSnippet = sidebarMatch ? sidebarMatch[0] : '';

const newArticleHtmlStart = `  <main class="container">
  <div class="article-layout">
  <div class="article-main">
    <article>
      <header class="article-header">
        <a href="\${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">\${data.category}</a>
        <h1 class="article-title">\${data.title}</h1>
        <div class="article-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">\${["Emma Collins", "David Thorne", "Alex Mercer"][Math.floor(Math.random()*3)]}</span> &bull; \${dateStr}</div>
      </header>
      <div class="article-featured-image"><img src="\${imageUrl}" alt="\${data.title}"></div>
      <div class="article-body">\${data.htmlContent}</div>
    </article>
  </div>
  ${sidebarSnippet}
  </div>
  </main>`;

if (single.includes(oldArticleHtmlStart) && sidebarSnippet) {
    single = single.replace(oldArticleHtmlStart, newArticleHtmlStart);
}

fs.writeFileSync('single-publish.js', single);
console.log('Updated single-publish.js with relevant link selection & layout template');
