require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { execSync } = require('child_process');
const { fetchUniqueRelevantImages } = require('./image-fetcher');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Please set GEMINI_API_KEY in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

async function generateSingle() {
    const keyword = process.argv[2] || "smart phone";
    const cat = "Lifestyle";
    
    console.log(`Generating: ${keyword}...`);
    
    try {
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
        
        let text = response.text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);
        data.htmlContent = data.htmlContent.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/i, '');

        // Automatically remove hyphens/dashes between words in the generated article body
        data.htmlContent = data.htmlContent.replace(/(>)([^<]+)(<)/g, (match, prefix, textNode, suffix) => {
            let cleanText = textNode;
            while (/([A-Za-z0-9]+)[-–—]([A-Za-z0-9]+)/.test(cleanText)) {
                cleanText = cleanText.replace(/([A-Za-z0-9]+)[-–—]([A-Za-z0-9]+)/g, '$1 $2');
            }
            return prefix + cleanText + suffix;
        });
        
        // Auto-inject internal links if the AI failed to add them
        
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
        
        // Get contextually relevant articles for internal linking
        const idxForLinks = fs.readFileSync('index.html', 'utf8');
        const linkRx = /<article class="post-card">[\s\S]*?<a href="([^"]+)" class="post-img-wrapper">[\s\S]*?<a href="[^"]*" class="post-category">([^<]+)<\/a>[\s\S]*?<h3 class="post-title">([^<]+)<\/h3>/g;
        const linkArticles = [];
        let lm;
        while ((lm = linkRx.exec(idxForLinks)) !== null) {
            if (lm[1] !== slug + '.html') {
                linkArticles.push({ href: lm[1], category: lm[2].trim(), title: lm[3].trim() });
            }
        }

        // Score relevance against current keyword/title/category
        const kwTokens = (keyword + ' ' + (data.category || '')).toLowerCase().split(/[\s,-]+/).filter(w => w.length > 2);
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
        const lnk2 = linkArticles[1] || linkArticles[0] || { href: 'index.html', title: 'Trending Coverage' };

        let pCount = 0;
        html = html.replace(/<\/p>/g, (match) => {
            pCount++;
            let append = '';
            if (pCount === 1) append = ' You might also enjoy reading <a href="' + lnk1.href + '" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">' + lnk1.title + '</a>.';
            if (pCount === 3) append = ' Discover more in <a href="' + lnk2.href + '" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">' + lnk2.title + '</a>.';
            
            let imgAppend = '';
            if (pCount === 2) imgAppend = '\n<img src="' + inlineImg1 + '" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="' + keyword + '">';
            if (pCount === 5) imgAppend = '\n<img src="' + inlineImg2 + '" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="' + keyword + '">';
            
            return append + match + imgAppend;
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
          <li><a href="index.html">Home</a></li>
          <li><a href="lifestyle.html">Lifestyle</a></li>
          <li><a href="entertainment.html">Entertainment</a></li>
          <li><a href="technology.html">Technology</a></li>
          <li><a href="health.html">Health</a></li>
          <li><a href="travel.html">Travel</a></li>
          <li><a href="business.html">Business</a></li>
          <li><a href="fashion.html">Fashion</a></li>
          <li><a href="food.html">Food</a></li>
          <li><a href="trending-news.html">Trending News</a></li>
        </ul>
      </div>
    </nav>
  </header>
  <main class="container">
  <div class="article-layout">
  <div class="article-main">
    <article>
      <header class="article-header">
        <a href="${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">${data.category}</a>
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
 
 <!-- Trending Widget -->
 <div class="sidebar-widget">
 <h3 class="widget-title"><span class="tag-box">Latest Posts</span></h3>
 <ul class="trending-list">
            
            
            
            
            <!-- NEW_TRENDING_ANCHOR -->
            <li>
              <a href="the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html"><img src="https://images.unsplash.com/photo-1545488897-424e53f3ad92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMDYxNjkzfDB8MXxyYW5kb218fHx8fHx8fHwxNzg5MDQwNjY1fA&ixlib=rb-4.1.0&q=80&w=1080" class="sidebar-thumbnail"></a>
              <div class="sidebar-post-info">
                <a href="technology.html" class="post-category">Technology</a>
                <a href="the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html" class="trending-title">The Ultimate Guide to Smart Home Gadgets: Elevating Modern Living</a>
                <span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">David Thorne</span> &bull; September 10, 2026</span>
              </div>
            </li>
            <li>
              <a href="the-ultimate-guide-to-choosing-the-perfect-bathroom-sink-for-your-home.html"><img src="https://image.pollinations.ai/prompt/bathroom%20sink%20photorealistic%20high%20quality?width=1200&height=800&nologo=true" class="sidebar-thumbnail"></a>
              <div class="sidebar-post-info">
                <a href="lifestyle.html" class="post-category">Lifestyle</a>
                <a href="the-ultimate-guide-to-choosing-the-perfect-bathroom-sink-for-your-home.html" class="trending-title">The Ultimate Guide to Choosing the Perfect Bathroom Sink for Your Home</a>
                <span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">Alex Mercer</span> &bull; September 10, 2026</span>
              </div>
            </li>
            <li>
              <a href="how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html"><img src="https://image.pollinations.ai/prompt/smart%20phone%20photorealistic%20high%20quality?width=1200&height=800&nologo=true" class="sidebar-thumbnail"></a>
              <div class="sidebar-post-info">
                <a href="lifestyle.html" class="post-category">Lifestyle</a>
                <a href="how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html" class="trending-title">How to Choose the Ultimate Smart Phone for Your Modern Lifestyle</a>
                <span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">David Thorne</span> &bull; September 10, 2026</span>
              </div>
            </li>
            <li>
              <a href="the-complete-guide-to-buy-bed-furniture-that-guarantees-restful-sleep.html"><img src="https://image.pollinations.ai/prompt/buy%20bed%20photorealistic%20high%20quality?width=1200&height=800&nologo=true" class="sidebar-thumbnail"></a>
              <div class="sidebar-post-info">
                <a href="lifestyle.html" class="post-category">Lifestyle</a>
                <a href="the-complete-guide-to-buy-bed-furniture-that-guarantees-restful-sleep.html" class="trending-title">The Complete Guide to Buy Bed Furniture That Guarantees Restful Sleep</a>
                <span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">Emma Collins</span> &bull; September 10, 2026</span>
              </div>
            </li>
            <li>
              <a href="the-ultimate-shopping-guide-how-to-buy-bed-designs-for-dreamy-sleep.html"><img src="https://image.pollinations.ai/prompt/buy%20bed%20photorealistic%20high%20quality?width=150&height=150&nologo=true" class="sidebar-thumbnail"></a>
              <div class="sidebar-post-info">
                <a href="lifestyle.html" class="post-category">Lifestyle</a>
                <a href="the-ultimate-shopping-guide-how-to-buy-bed-designs-for-dreamy-sleep.html" class="trending-title">The Ultimate Shopping Guide: How to Buy Bed Designs for Dreamy Sleep</a>
                <span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">Emma Collins</span> &bull; September 10, 2026</span>
              </div>
            </li>
            <li>
              <a href="the-ultimate-guide-to-buy-iphone-how-to-choose-the-right-model-for-your-needs.html"><img src="https://image.pollinations.ai/prompt/buy%20iphone%20photorealistic%20high%20quality?width=150&height=150&nologo=true" class="sidebar-thumbnail"></a>
              <div class="sidebar-post-info">
                <a href="technology.html" class="post-category">Technology</a>
                <a href="the-ultimate-guide-to-buy-iphone-how-to-choose-the-right-model-for-your-needs.html" class="trending-title">The Ultimate Guide to Buy iPhone: How to Choose the Right Model for Your Needs</a>
                <span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">David Thorne</span> &bull; September 10, 2026</span>
              </div>
            </li>
            <li>
              <a href="transform-your-daily-routine-the-ultimate-guide-to-upgrading-your-bathroom-shower.html"><img src="https://image.pollinations.ai/prompt/bathroom%20shower%20photorealistic%20high%20quality?width=150&height=150&nologo=true" class="sidebar-thumbnail"></a>
              <div class="sidebar-post-info">
                <a href="lifestyle.html" class="post-category">Lifestyle</a>
                <a href="transform-your-daily-routine-the-ultimate-guide-to-upgrading-your-bathroom-shower.html" class="trending-title">Transform Your Daily Routine: The Ultimate Guide to Upgrading Your Bathroom Shower</a>
                <span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">Emma Collins</span> &bull; September 10, 2026</span>
              </div>
            </li>
          </ul>
 </div>

 </aside>
  </div>
  </main>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div>
          <a href="index.html" class="logo footer-logo"><img src="logo-white.svg" alt="FeelDesire"></a>
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
            <li><a href="lifestyle.html">Lifestyle</a></li>
            <li><a href="technology.html">Technology</a></li>
            <li><a href="health.html">Health</a></li>
            <li><a href="travel.html">Travel</a></li>
            <li><a href="entertainment.html">Entertainment</a></li>
            <li><a href="trending-news.html">Trending News</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title">Company</h4>
          <ul class="footer-links">
            <li><a href="about-us.html">About Us</a></li>
            <li><a href="our-story.html">Our Story</a></li>
            <li><a href="contact.html">Contact Us</a></li>
            <li><a href="advertise.html">Advertise</a></li>
            <li><a href="privacy-policy.html">Privacy Policy</a></li>
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
          <a href="privacy-policy.html">Privacy Policy</a>
          <a href="contact.html">Terms of Service</a>
          <a href="about-us.html">Editorial Guidelines</a>
        </div>
      </div>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;

        fs.writeFileSync(`${slug}.html`, articleHtml);

        // --- Inject Related & Latest Articles ---
        const idxHtml = fs.readFileSync('index.html', 'utf8');
        const cardRx = /<article class="post-card">\s*<a href="([^"]+)" class="post-img-wrapper"><img src="([^"]+)"><\/a>\s*<div class="post-content">\s*<a href="[^"]*" class="post-category">([^<]+)<\/a>\s*<a href="[^"]*"><h3 class="post-title">([^<]+)<\/h3><\/a>\s*<div class="post-meta">By <span[^>]*>([^<]+)<\/span>\s*&bull;\s*([^<]+)<\/div>\s*<p class="post-excerpt">([^<]*)<\/p>/g;
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


        let indexContent = fs.readFileSync('index.html', 'utf8');
        const cardHtml = `
            <!-- NEW_ARTICLE_ANCHOR -->
            <article class="post-card">
              <a href="${slug}.html" class="post-img-wrapper"><img src="${imageUrl}"></a>
              <div class="post-content">
                <a href="${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">${data.category}</a>
                <a href="${slug}.html"><h3 class="post-title">${data.title}</h3></a>
                <div class="post-meta">By <a href="${assignedAuthor.slug}" class="author-link">${assignedAuthor.name}</a> &bull; ${dateStr}</div>
                <p class="post-excerpt">${data.excerpt}</p>
              </div>
            </article>`;
            
        const sidebarHtml = `
            <!-- NEW_TRENDING_ANCHOR -->
            <li>
              <a href="${slug}.html"><img src="${imageUrl}" class="sidebar-thumbnail"></a>
              <div class="sidebar-post-info">
                <a href="${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">${data.category}</a>
                <a href="${slug}.html" class="trending-title">${data.title}</a>
                <span class="post-meta">By <a href="${assignedAuthor.slug}" class="author-link">${assignedAuthor.name}</a> &bull; ${dateStr}</span>
              </div>
            </li>`;

        indexContent = indexContent.replace('<!-- NEW_ARTICLE_ANCHOR -->', cardHtml);
        indexContent = indexContent.replace('<!-- NEW_TRENDING_ANCHOR -->', sidebarHtml);
        fs.writeFileSync('index.html', indexContent);
        require('child_process').execSync('node rebuild-categories.js');
        
        console.log(`   Saved ${slug}.html`);
    } catch (e) {
        console.error("Error generating", keyword, e.message); throw e;
    }

  console.log("Pushing to GitHub...");
  execSync('git add .');
  execSync(`git commit -m "Publish article: ${keyword}"`);
  execSync('git push origin main');
  console.log("Done!");
}

async function run() { let success = false; while(!success) { try { await generateSingle(); success=true; } catch(e) { console.log("Retrying in 45s..."); await new Promise(r => setTimeout(r, 45000)); } } } run();
















