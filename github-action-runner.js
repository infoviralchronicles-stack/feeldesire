require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { fetchUniqueRelevantImages } = require('./image-fetcher');
const { injectNaturalInternalLinks, getAvailableArticles } = require('./link-injector');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Please set GEMINI_API_KEY environment variable.");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

function getNextKeyword() {
    // 1. If passed via CLI argument
    if (process.argv[2] && process.argv[2].trim()) {
        return { keyword: process.argv[2].trim(), fromQueue: false };
    }

    // 2. Otherwise read the first keyword from keywords.txt
    const kwPath = path.join(__dirname, 'keywords.txt');
    if (fs.existsSync(kwPath)) {
        const lines = fs.readFileSync(kwPath, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
            const nextKw = lines.shift(); // take the first
            fs.writeFileSync(kwPath, lines.join('\n') + '\n', 'utf8');
            return { keyword: nextKw, fromQueue: true };
        }
    }

    return { keyword: "smart home gadgets", fromQueue: false };
}

async function generateAndPublish() {
    const { keyword, fromQueue } = getNextKeyword();
    console.log(`[Auto-Publish] Target Keyword: "${keyword}" (From queue: ${fromQueue})`);

    const prompt = `You are an expert SEO magazine writer. Write a massive, highly comprehensive, and 100% SEO-optimized article about "${keyword}".
Return ONLY a valid JSON object (no markdown formatting) with these keys:
{"title": "Catchy title MUST contain the exact keyword \"${keyword}\"", "category": "Travel", "excerpt": "1 sentence SEO meta description", "htmlContent": "HTML body without html/body tags."}
Choose the most relevant category from: Travel, Lifestyle, Technology, Health, Business, Entertainment, Fashion, Food, Trending News.
IMPORTANT CONTENT RULES (CRITICAL FOR WORD COUNT):
1. The article MUST be extremely long, spanning exactly between 950 and 1050 words.
2. You MUST write at least 8 distinct sections (H2).
3. Each section MUST contain at least 2 very detailed, long paragraphs. Do not write short sections.
4. Include a comprehensive "Pros and Cons" section and a detailed "Frequently Asked Questions (FAQ)" section with at least 5 questions but keep the answers very short and concise (1 to 2 sentences maximum).
5. Provide high value, deeply informative, and expansive content. Do not be concise. Expand on every single detail.
SEO RULES:
6. Use the exact keyword '${keyword}' in the first 50 words, bolded (<strong>).
7. Do NOT include the current year anywhere.
8. Do NOT include an H1 tag.
9. Avoid hyphenated words (e.g. write "high refresh rate" instead of "High-refresh-rate", "real time" instead of "real-time", "high quality" instead of "high-quality"). Use clean spaces instead of dashes.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    let text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(text);
    data.htmlContent = data.htmlContent.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/i, '');

    // Automatically remove hyphens/dashes between words in the generated article body (preserving HTML tags and attributes)
    data.htmlContent = data.htmlContent.replace(/(>)([^<]+)(<)/g, (match, prefix, textNode, suffix) => {
        let cleanText = textNode;
        while (/([A-Za-z0-9]+)[-–—]([A-Za-z0-9]+)/.test(cleanText)) {
            cleanText = cleanText.replace(/([A-Za-z0-9]+)[-–—]([A-Za-z0-9]+)/g, '$1 $2');
        }
        return prefix + cleanText + suffix;
    });

    const fetchedImgs = await fetchUniqueRelevantImages(keyword, data.category, __dirname);
    const imageUrl = fetchedImgs.featured;
    const inlineImg1 = fetchedImgs.inline1;
    const inlineImg2 = fetchedImgs.inline2;

    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const authorList = [
      { name: "Emma Collins", slug: "author-emma-collins.html", role: "Senior Lifestyle & Architecture Editor", bio: "Emma Collins specializes in intentional living, interior ergonomics, circadian wellness, and sustainable home design.", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=400&q=80" },
      { name: "David Thorne", slug: "author-david-thorne.html", role: "Senior Technology & Digital Infrastructure Lead", bio: "David Thorne has spent over a decade reporting on consumer hardware, artificial intelligence architectures, quantum systems, and modern smart ecosystems.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=400&q=80" },
      { name: "Alex Mercer", slug: "author-alex-mercer.html", role: "Culture & Entertainment Correspondent", bio: "Alex Mercer covers cinematic milestones, streaming industry economics, digital culture movements, and modern creative arts.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=400&q=80" }
    ];
    const assignedAuthor = authorList[Math.floor(Math.random() * authorList.length)];

    let html = data.htmlContent;
    
    // Inject natural internal links directly into relevant keywords in the body
    html = injectNaturalInternalLinks(html, slug, data.category, __dirname);

    // Insert inline images at natural reading break points
    let pCount = 0;
    html = html.replace(/<\/p>/g, (match) => {
        pCount++;
        let imgAppend = '';
        if (pCount === 2) imgAppend = '\n<img src="' + inlineImg1 + '" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="' + keyword + '">';
        if (pCount === 5) imgAppend = '\n<img src="' + inlineImg2 + '" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="' + keyword + '">';
        return match + imgAppend;
    });
    data.htmlContent = html;

    const articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - FeelDesire</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">

  <meta name="description" content="${data.excerpt.replace(/"/g, '&quot;')}">
  <link rel="canonical" href="https://feeldesire.com/${slug}">
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://feeldesire.com/${slug}">
  <meta property="og:site_name" content="FeelDesire">
  <meta property="og:title" content="${data.title} - FeelDesire">
  <meta property="og:description" content="${data.excerpt.replace(/"/g, '&quot;')}">
  <meta property="og:image" content="${imageUrl}">
  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://feeldesire.com/${slug}">
  <meta name="twitter:title" content="${data.title} - FeelDesire">
  <meta name="twitter:description" content="${data.excerpt.replace(/"/g, '&quot;')}">
  <meta name="twitter:image" content="${imageUrl}">
  <!-- Structured Data JSON-LD -->
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "${data.title.replace(/"/g, '\\"')}",
  "image": ["${imageUrl}"],
  "datePublished": "${new Date().toISOString().split('T')[0]}",
  "dateModified": "${new Date().toISOString().split('T')[0]}",
  "author": [{
    "@type": "Person",
    "name": "${assignedAuthor.name}"
  }],
  "publisher": {
    "@type": "Organization",
    "name": "FeelDesire",
    "logo": {
      "@type": "ImageObject",
      "url": "https://feeldesire.com/logo.svg"
    }
  },
  "description": "${data.excerpt.replace(/"/g, '\\"')}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://feeldesire.com/${slug}"
  }
}
  </script>
</head>
<body>
  <header>
    <div class="container">
      <div class="header-top">
        <a href="index.html" class="logo"><img src="logo.svg" alt="FeelDesire"></a>
      </div>
    </div>
    <nav class="main-nav">
      <div class="container">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="lifestyle">Lifestyle</a></li>
          <li><a href="entertainment">Entertainment</a></li>
          <li><a href="technology">Technology</a></li>
          <li><a href="health">Health</a></li>
          <li><a href="travel">Travel</a></li>
          <li><a href="business">Business</a></li>
          <li><a href="fashion">Fashion</a></li>
          <li><a href="food">Food</a></li>
          <li><a href="trending-news">Trending News</a></li>
        </ul>
      </div>
    </nav>
  </header>
  <main class="container">
  <div class="article-layout">
  <div class="article-main">
    <article>
      <header class="article-header">
        <a href="${data.category.toLowerCase().replace(' ', '-')}" class="post-category">${data.category}</a>
        <h1 class="article-title">${data.title}</h1>
        <div class="article-meta">By <a href="${assignedAuthor.slug}" class="author-link">${assignedAuthor.name}</a> &bull; ${dateStr}</div>
      </header>
      <div class="article-featured-image"><img src="${imageUrl}" alt="${data.title}"></div>
      <div class="article-body">${data.htmlContent}</div>
      <!-- Author Bio Box -->
      <div class="author-box">
        <img src="${assignedAuthor.avatar}" alt="${assignedAuthor.name}" class="author-box-avatar">
        <div class="author-box-content">
          <span class="author-box-label">Written by</span>
          <h4 class="author-box-name"><a href="${assignedAuthor.slug}">${assignedAuthor.name}</a></h4>
          <p class="author-box-bio">${assignedAuthor.bio}</p>
          <a href="${assignedAuthor.slug}" class="author-box-link">View all articles by ${assignedAuthor.name} &rarr;</a>
        </div>
      </div>
    </article>
  </div>
  <aside class="sidebar">
  <div class="sidebar-widget">
    <h3 class="widget-title"><span class="tag-box">Latest Posts</span></h3>
    <ul class="trending-list">
      <!-- NEW_TRENDING_ANCHOR -->
    </ul>
  </div>
  </aside>
  </div>
  </main>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div>
          <a href="/" class="logo footer-logo"><img src="logo-white.svg" alt="FeelDesire"></a>
          <p class="footer-desc">Your daily destination for cutting-edge lifestyle trends, tech innovations, health insights, and global stories. Curated for modern living.</p>
          <div class="footer-socials">
            <a href="https://twitter.com" target="_blank" rel="noopener" class="footer-social-link" aria-label="Twitter">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener" class="footer-social-link" aria-label="Facebook">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener" class="footer-social-link" aria-label="Instagram">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h4 class="footer-title">Categories</h4>
          <ul class="footer-links">
            <li><a href="lifestyle">Lifestyle</a></li>
            <li><a href="technology">Technology</a></li>
            <li><a href="health">Health</a></li>
            <li><a href="travel">Travel</a></li>
            <li><a href="entertainment">Entertainment</a></li>
            <li><a href="trending-news">Trending News</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title">Company</h4>
          <ul class="footer-links">
            <li><a href="about-us">About Us</a></li>
            <li><a href="our-story">Our Story</a></li>
            <li><a href="contact">Contact Us</a></li>
            <li><a href="advertise">Advertise</a></li>
            <li><a href="privacy-policy">Privacy Policy</a></li>
          </ul>
        </div>
        <div class="footer-newsletter">
          <h4 class="footer-title">Newsletter</h4>
          <p>Get the latest stories, weekly roundups, and exclusive insights delivered to your inbox.</p>
          <form class="footer-newsletter-form" onsubmit="event.preventDefault(); alert('Thank you for subscribing to FeelDesire!');">
            <input type="email" placeholder="Your email address" required>
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 FeelDesire. All Rights Reserved.</p>
        <div class="footer-bottom-links">
          <a href="privacy-policy">Privacy Policy</a>
          <a href="contact">Terms of Service</a>
          <a href="about-us">Editorial Guidelines</a>
        </div>
      </div>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;

    fs.writeFileSync(slug + '.html', articleHtml);

    // Read all articles from index for bottom widgets
    const idxHtml = fs.readFileSync('index.html', 'utf8');
    const cardRx = /<article class="post-card">\s*<a href="([^"]+)" class="post-img-wrapper"><img src="([^"]+)"><\/a>\s*<div class="post-content">\s*<a href="[^"]*" class="post-category">([^<]+)<\/a>\s*<a href="[^"]*"><h3 class="post-title">([^<]+)<\/h3><\/a>\s*<div class="post-meta">By <[^>]+>([^<]+)<\/[^>]+>\s*&bull;\s*([^<]+)<\/div>\s*<p class="post-excerpt">([^<]*)<\/p>/g;
    const allArticles = [];
    let cm;
    while ((cm = cardRx.exec(idxHtml)) !== null) {
        const cleanHref = cm[1].replace(/\.html$/, '');
        allArticles.push({ href: cleanHref, image: cm[2], category: cm[3].trim(), title: cm[4].trim(), author: cm[5].trim(), date: cm[6].trim() });
    }
    const cleanSlug = slug.replace(/\.html$/, '');
    const related = allArticles.filter(a => a.category === data.category && a.href !== cleanSlug).slice(0, 3);
    const latest = allArticles.filter(a => a.href !== cleanSlug).slice(0, 4);
    function mkCard(a) {
        const catSlug = a.category.toLowerCase().replace(' ', '-');
        return '<article class="post-card"><a href="' + a.href + '" class="post-img-wrapper"><img src="' + a.image + '"></a><div class="post-content"><a href="' + catSlug + '" class="post-category">' + a.category + '</a><a href="' + a.href + '"><h3 class="post-title">' + a.title + '</h3></a><div class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">' + a.author + '</span> &bull; ' + a.date + '</div></div></article>';
    }
    let sectionsHtml = '';
    if (related.length > 0) {
        sectionsHtml += '<section class="related-articles" style="margin-top:50px;"><div class="container"><h2 class="section-title"><span class="tag-box">Related Articles</span></h2><div class="posts-grid">' + related.map(mkCard).join('') + '</div></div></section>';
    }
    sectionsHtml += '<section class="latest-articles" style="margin-top:50px;margin-bottom:40px;"><div class="container"><h2 class="section-title"><span class="tag-box">Latest Articles</span></h2><div class="posts-grid">' + latest.map(mkCard).join('') + '</div></div></section>';
    
    let finalHtml = fs.readFileSync(slug + '.html', 'utf8');
    finalHtml = finalHtml.replace('<footer>', sectionsHtml + '<footer>');
    fs.writeFileSync(slug + '.html', finalHtml);

    // Update index.html
    let indexContent = fs.readFileSync('index.html', 'utf8');
    const cardHtml = `
            <!-- NEW_ARTICLE_ANCHOR -->
            <article class="post-card">
              <a href="${slug}" class="post-img-wrapper"><img src="${imageUrl}"></a>
              <div class="post-content">
                <a href="${data.category.toLowerCase().replace(' ', '-')}" class="post-category">${data.category}</a>
                <a href="${slug}"><h3 class="post-title">${data.title}</h3></a>
                <div class="post-meta">By <a href="${assignedAuthor.slug}" class="author-link">${assignedAuthor.name}</a> &bull; ${dateStr}</div>
                <p class="post-excerpt">${data.excerpt}</p>
              </div>
            </article>`;
            
    const sidebarHtml = `
            <!-- NEW_TRENDING_ANCHOR -->
            <li>
              <a href="${slug}"><img src="${imageUrl}" class="sidebar-thumbnail"></a>
              <div class="sidebar-post-info">
                <a href="${data.category.toLowerCase().replace(' ', '-')}" class="post-category">${data.category}</a>
                <a href="${slug}" class="trending-title">${data.title}</a>
                <span class="post-meta">By <a href="${assignedAuthor.slug}" class="author-link">${assignedAuthor.name}</a> &bull; ${dateStr}</span>
              </div>
            </li>`;

    indexContent = indexContent.replace('<!-- NEW_ARTICLE_ANCHOR -->', cardHtml);
    indexContent = indexContent.replace('<!-- NEW_TRENDING_ANCHOR -->', sidebarHtml);
    fs.writeFileSync('index.html', indexContent);

    // Rebuild categories and sitemap
    require('child_process').execSync('node rebuild-categories.js');
    require('child_process').execSync('node generate-sitemap.js');
    console.log(`[Auto-Publish] Successfully published: ${slug}.html and updated sitemap`);
}

async function run() {
    let attempts = 0;
    while (attempts < 5) {
        try {
            attempts++;
            await generateAndPublish();
            console.log("[Auto-Publish] All operations completed successfully.");
            process.exit(0);
        } catch(e) {
            console.error(`[Auto-Publish] Error on attempt ${attempts}:`, e.message);
            if (attempts < 5) {
                console.log("[Auto-Publish] Retrying in 45 seconds...");
                await new Promise(r => setTimeout(r, 45000));
            } else {
                console.error("[Auto-Publish] Exceeded maximum retry attempts.");
                process.exit(1);
            }
        }
    }
}

run();
