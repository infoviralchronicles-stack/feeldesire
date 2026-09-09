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
    const keyword = "buy laptop";
    const cat = "Technology";
    
    console.log(`Generating: ${keyword}...`);
    
    try {
        const prompt = `You are an expert magazine writer. Write a comprehensive, engaging article about "${keyword}".
Return ONLY a valid JSON object (no markdown formatting) with these keys:
{"title": "Catchy title", "category": "${cat}", "excerpt": "1 sentence summary", "htmlContent": "HTML body (<p>, <h2>) without html/body tags. DO NOT include the title in the htmlContent."}
IMPORTANT: DO NOT include the current year (like 2026) in the title or the content of the article.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        let text = response.text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);
        data.htmlContent = data.htmlContent.replace(/^\s*<h[12][^>]*>.*?<\/h[12]>\s*/i, '');

        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const imageUrl = `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/1200/800`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - FeelDesire</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <div class="container">
      <div class="header-top">
        <a href="index.html" class="logo">Feel<span>Desire</span></a>
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
    <article>
      <header class="article-header">
        <a href="${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">${data.category}</a>
        <h1 class="article-title">${data.title}</h1>
        <div class="article-meta">By AI Editor | ${dateStr}</div>
      </header>
      <div class="article-featured-image"><img src="${imageUrl}" alt="${data.title}"></div>
      <div class="article-body">${data.htmlContent}</div>
    </article>
  </main>
</body>
</html>`;

        fs.writeFileSync(`${slug}.html`, html);

        let indexContent = fs.readFileSync('index.html', 'utf8');
        const cardHtml = `
            <article class="post-card">
              <a href="${slug}.html" class="post-img-wrapper"><img src="${imageUrl}"></a>
              <div class="post-content">
                <a href="${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">${data.category}</a>
                <a href="${slug}.html"><h3 class="post-title">${data.title}</h3></a>
                <div class="post-meta">${dateStr}</div>
                <p class="post-excerpt">${data.excerpt}</p>
              </div>
            </article>
            <!-- NEW_ARTICLE_ANCHOR -->`;
        indexContent = indexContent.replace('<!-- NEW_ARTICLE_ANCHOR -->', cardHtml);
        fs.writeFileSync('index.html', indexContent);
        
        console.log(`   Saved ${slug}.html`);
    } catch (e) {
        console.error("Error generating", keyword, e.message);
    }

  console.log("Pushing to GitHub...");
  execSync('git add .');
  execSync('git commit -m "Publish buy laptop article without year and fix admin prompt"');
  execSync('git push origin main');
  console.log("Done!");
}

generateSingle();

