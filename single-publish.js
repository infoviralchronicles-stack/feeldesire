require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { execSync } = require('child_process');

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
{"title": "Catchy title MUST contain the exact keyword \"${keyword}\"", "category": "Technology", "excerpt": "1 sentence SEO meta description", "htmlContent": "HTML body without html/body tags."}
IMPORTANT CONTENT RULES (CRITICAL FOR WORD COUNT):
1. The article MUST be extremely long, spanning exactly between 950 and 1050 words.
2. You MUST write at least 8 distinct sections (H2).
3. Each section MUST contain at least 2 very detailed, long paragraphs. Do not write short sections.
4. Include a comprehensive "Pros and Cons" section and a detailed "Frequently Asked Questions (FAQ)" section with at least 5 questions but keep the answers very short and concise (1 to 2 sentences maximum).
5. Provide high value, deeply informative, and expansive content. Do not be concise. Expand on every single detail.
SEO RULES:
6. Use the exact keyword '${keyword}' in the first 50 words, bolded (<strong>).
7. Do NOT include the current year anywhere.
8. Do NOT include an H1 tag.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        let text = response.text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);
        data.htmlContent = data.htmlContent.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/i, '');
        
        // Auto-inject internal links if the AI failed to add them
        
    const unsplashKey = "hFl_35GKYSCzGjcC_nZrnchqvcvTJ17FTlCHL6IK6sg";
    const unsplashUrl = 'https://api.unsplash.com/photos/random?count=3&query=' + encodeURIComponent(keyword) + '&client_id=' + unsplashKey;
    let images = [];
    try {
        const uRes = await fetch(unsplashUrl);
        if(uRes.ok) {
            images = await uRes.json();
        }
    } catch(e) { console.error(e); }
    
    const imageUrl = images[0] ? images[0].urls.regular : "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop";
    const inlineImg1 = images[1] ? images[1].urls.regular : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop";
    const inlineImg2 = images[2] ? images[2].urls.regular : "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop";

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

const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        

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
        <div class="search-bar"><a href="admin.html" style="background:#2c3e50; color:white; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:600;">Admin Dashboard</a></div>
      </div>
    </div>
    <nav class="main-nav">
      <div class="container">
        <ul>
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
        <div class="article-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">${["Emma Collins", "David Thorne", "Alex Mercer"][Math.floor(Math.random()*3)]}</span> &bull; ${dateStr}</div>
      </header>
      <div class="article-featured-image"><img src="${imageUrl}" alt="${data.title}"></div>
      <div class="article-body">${data.htmlContent}</div>
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
          <p class="footer-desc">Your daily source for lifestyle, entertainment, tech, and health news. Stay inspired, stay informed.</p>
        </div>
        <div>
          <h4 class="footer-title">Categories</h4>
          <ul class="footer-links">
            <li><a href="lifestyle.html">Lifestyle</a></li>
            <li><a href="technology.html">Technology</a></li>
            <li><a href="health.html">Health</a></li>
            <li><a href="travel.html">Travel</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title">About Us</h4>
          <ul class="footer-links">
            <li><a href="our-story.html">Our Story</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="advertise.html">Advertise</a></li>
            <li><a href="privacy-policy.html">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; FeelDesire. All Rights Reserved.</p>
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
                <div class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">${["Emma Collins", "David Thorne", "Alex Mercer"][Math.floor(Math.random()*3)]}</span> &bull; ${dateStr}</div>
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
                <span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">${["Emma Collins", "David Thorne", "Alex Mercer"][Math.floor(Math.random()*3)]}</span> &bull; ${dateStr}</span>
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
  execSync('git commit -m "Publish buy laptop article without year and fix admin prompt"');
  execSync('git push origin main');
  console.log("Done!");
}

async function run() { let success = false; while(!success) { try { await generateSingle(); success=true; } catch(e) { console.log("Retrying in 45s..."); await new Promise(r => setTimeout(r, 45000)); } } } run();
















