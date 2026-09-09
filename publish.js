require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { execSync } = require('child_process');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Please set the GEMINI_API_KEY environment variable in a .env file.");
    process.exit(1);
}

const keyword = process.argv[2];
if (!keyword) {
    console.error('Please provide a keyword. Example: node publish.js "Best Laptops 2026"');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

async function publish() {
    console.log(`Generating article for keyword: "${keyword}"...`);
    
    const prompt = `You are an expert magazine writer. Write a comprehensive, engaging article about "${keyword}".
Return ONLY a valid JSON object with the following keys, no markdown wrappers:
{
    "title": "A catchy title for the article",
    "category": "One of: Lifestyle, Entertainment, Technology, Health, Travel, Business, Fashion, Food, or Trending News",
    "excerpt": "A 1-2 sentence summary for the homepage card.",
    "htmlContent": "The main content of the article wrapped in standard HTML tags (e.g., <p>, <h2>, <blockquote>). Do not include <html>, <head>, or <body> tags."
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const data = JSON.parse(response.text);
        const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const htmlFile = `${slug}.html`;
        const randomId = Math.floor(Math.random() * 1000);
        const imageUrl = `https://picsum.photos/seed/${randomId}/1200/800`;
        
        const articleTemplate = `<!DOCTYPE html>
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
        <div class="search-bar">
          <input type="text" placeholder="Search articles...">
          <button type="submit">Search</button>
        </div>
        <button class="mobile-menu-btn" aria-label="Toggle Navigation">&#9776;</button>
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
        <div class="article-meta">
          By <a href="#"><strong>AI Editor</strong></a> | ${dateStr} | 5 min read
        </div>
      </header>
      <div class="article-featured-image">
        <img src="${imageUrl}" alt="${data.title}">
      </div>
      <div class="article-body">
        ${data.htmlContent}
      </div>
    </article>
  </main>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div>
          <a href="index.html" class="logo footer-logo">Feel<span>Desire</span></a>
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
            <li><a href="about-us.html">About Us</a></li>
            <li><a href="our-story.html">Our Story</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="advertise.html">Advertise</a></li>
            <li><a href="privacy-policy.html">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 FeelDesire. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;

        fs.writeFileSync(htmlFile, articleTemplate);
        console.log(`Created page: ${htmlFile}`);

        let indexContent = fs.readFileSync('index.html', 'utf8');
        
        const cardHtml = `
            <article class="post-card">
              <a href="${htmlFile}" class="post-img-wrapper">
                <img src="${imageUrl}" alt="${data.category}">
              </a>
              <div class="post-content">
                <a href="${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">${data.category}</a>
                <a href="${htmlFile}">
                  <h3 class="post-title">${data.title}</h3>
                </a>
                <div class="post-meta">By AI Editor • ${dateStr}</div>
                <p class="post-excerpt">${data.excerpt}</p>
              </div>
            </article>
            <!-- NEW_ARTICLE_ANCHOR -->`;

        indexContent = indexContent.replace('<!-- NEW_ARTICLE_ANCHOR -->', cardHtml);

        const trendingHtml = `
            <li>
              <a href="${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">${data.category}</a>
              <a href="${htmlFile}" class="trending-title">${data.title}</a>
              <span class="post-meta">Just now</span>
            </li>
            <!-- NEW_TRENDING_ANCHOR -->`;
            
        indexContent = indexContent.replace('<!-- NEW_TRENDING_ANCHOR -->', trendingHtml);
        
        fs.writeFileSync('index.html', indexContent);
        
        console.log("Pushing to GitHub (Auto-Deploy)...");
        execSync('git add .');
        execSync(`git commit -m "Auto-published article: ${data.title}"`);
        execSync('git push -u origin main');
        
        console.log("Done! Article is published and Vercel is deploying it.");
    } catch (e) {
        console.error("Error generating or publishing article:", e);
    }
}

publish();
