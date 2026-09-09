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

const articlesToGenerate = [
  { keyword: "Minimalist Living Tips", cat: "Lifestyle" },
  { keyword: "Morning Routine Habits", cat: "Lifestyle" },
  { keyword: "Upcoming Marvel Movies 2026", cat: "Entertainment" },
  { keyword: "Top Netflix Shows This Month", cat: "Entertainment" },
  { keyword: "AI Innovations 2026", cat: "Technology" },
  { keyword: "Quantum Computing Explained", cat: "Technology" },
  { keyword: "Benefits of Intermittent Fasting", cat: "Health" },
  { keyword: "Mental Health Tips", cat: "Health" },
  { keyword: "Best Hidden Gems in Europe", cat: "Travel" },
  { keyword: "Budget Travel Guide Asia", cat: "Travel" },
  { keyword: "Starting a Business in 2026", cat: "Business" },
  { keyword: "Stock Market Trends", cat: "Business" },
  { keyword: "Summer Fashion Trends 2026", cat: "Fashion" },
  { keyword: "Sustainable Clothing", cat: "Fashion" },
  { keyword: "Easy Weeknight Dinners", cat: "Food" },
  { keyword: "Best Vegan Recipes", cat: "Food" },
  { keyword: "Global Climate Summit Updates", cat: "Trending News" },
  { keyword: "Space Exploration News", cat: "Trending News" }
];

async function generateAndPublish() {
  console.log("Starting bulk generation...");
  let indexContent = fs.readFileSync('index.html', 'utf8');

  for (let i = 0; i < articlesToGenerate.length; i++) {
    const { keyword, cat } = articlesToGenerate[i];
    console.log(`Generating [${i+1}/${articlesToGenerate.length}]: ${keyword} (${cat})...`);
    
    try {
        const prompt = `You are an expert magazine writer. Write a comprehensive, engaging article about "${keyword}".
Return ONLY a valid JSON object (no markdown formatting) with these keys:
{"title": "Catchy title", "category": "${cat}", "excerpt": "1 sentence summary", "htmlContent": "HTML body (<p>, <h2>) without html/body tags"}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        let text = response.text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);

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
        
        console.log(`   Saved ${slug}.html`);
    } catch (e) {
        console.error("Error generating", keyword, e.message);
    }
  }

  fs.writeFileSync('index.html', indexContent);
  console.log("Pushing to GitHub...");
  execSync('git add .');
  execSync('git commit -m "Bulk publish 18 articles across all categories"');
  execSync('git push -u origin main');
  console.log("Done!");
}

generateAndPublish();



