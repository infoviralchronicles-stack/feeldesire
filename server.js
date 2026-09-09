require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Please set the GEMINI_API_KEY environment variable in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FeelDesire Admin Panel</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #f4f7f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 500px; width: 100%; text-align: center; }
            h1 { color: #2c3e50; font-size: 24px; margin-bottom: 10px; }
            p { color: #7f8c8d; margin-bottom: 30px; font-size: 14px; }
            input[type="text"] { width: 100%; padding: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; margin-bottom: 20px; box-sizing: border-box; outline: none; transition: border 0.3s; }
            input[type="text"]:focus { border-color: #3498db; }
            button { width: 100%; padding: 15px; background-color: #e74c3c; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.3s; }
            button:hover { background-color: #c0392b; }
            button:disabled { background-color: #95a5a6; cursor: not-allowed; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #fff; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 10px; display: none; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            #message { margin-top: 20px; font-weight: 600; font-size: 14px; }
            .success { color: #2ecc71; }
            .error { color: #e74c3c; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>FeelDesire AI Publisher</h1>
            <p>Enter a keyword to automatically write and publish an article.</p>
            <input type="text" id="keyword" placeholder="e.g. Best Laptops 2026">
            <button id="publishBtn" onclick="publish()">
                <div class="loader" id="loader"></div>
                <span id="btnText">Generate & Publish Article</span>
            </button>
            <div id="message"></div>
        </div>

        <script>
            async function publish() {
                const keyword = document.getElementById('keyword').value;
                if (!keyword) { alert("Please enter a keyword!"); return; }
                
                const btn = document.getElementById('publishBtn');
                const loader = document.getElementById('loader');
                const btnText = document.getElementById('btnText');
                const msg = document.getElementById('message');
                
                btn.disabled = true;
                loader.style.display = 'inline-block';
                btnText.innerText = 'Publishing... Please wait (1-2 mins)';
                msg.innerText = '';
                
                try {
                    const res = await fetch('/publish', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ keyword })
                    });
                    const data = await res.json();
                    
                    if (res.ok) {
                        msg.className = 'success';
                        msg.innerText = data.message + '\\nVercel is now deploying it!';
                        document.getElementById('keyword').value = '';
                    } else {
                        msg.className = 'error';
                        msg.innerText = 'Error: ' + data.error;
                    }
                } catch (err) {
                    msg.className = 'error';
                    msg.innerText = 'Network error occurred.';
                } finally {
                    btn.disabled = false;
                    loader.style.display = 'none';
                    btnText.innerText = 'Generate & Publish Article';
                }
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/publish', async (req, res) => {
    const keyword = req.body.keyword;
    if (!keyword) return res.status(400).json({ error: "Keyword is required" });

    try {
        const prompt = `You are an expert magazine writer. Write a comprehensive, engaging article about "${keyword}".
Return ONLY a valid JSON object with the following keys, no markdown wrappers:
{
    "title": "A catchy title for the article",
    "category": "One of: Lifestyle, Entertainment, Technology, Health, Travel, Business, Fashion, Food, or Trending News",
    "excerpt": "A 1-2 sentence summary for the homepage card.",
    "htmlContent": "The main content of the article wrapped in standard HTML tags (e.g., <p>, <h2>, <blockquote>). Do not include <html>, <head>, or <body> tags."
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const data = JSON.parse(response.text);
        const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const htmlFile = `${slug}.html`;
        const randomId = Math.floor(Math.random() * 1000);
        const imageUrl = `https://picsum.photos/seed/${randomId}/1200/800`;
        
        const articleTemplate = \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\${data.title} - FeelDesire</title>
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
        <a href="\${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">\${data.category}</a>
        <h1 class="article-title">\${data.title}</h1>
        <div class="article-meta">
          By <a href="#"><strong>AI Editor</strong></a> | \${dateStr} | 5 min read
        </div>
      </header>
      <div class="article-featured-image">
        <img src="\${imageUrl}" alt="\${data.title}">
      </div>
      <div class="article-body">
        \${data.htmlContent}
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
</html>\`;

        fs.writeFileSync(htmlFile, articleTemplate);

        let indexContent = fs.readFileSync('index.html', 'utf8');
        
        const cardHtml = \`
            <article class="post-card">
              <a href="\${htmlFile}" class="post-img-wrapper">
                <img src="\${imageUrl}" alt="\${data.category}">
              </a>
              <div class="post-content">
                <a href="\${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">\${data.category}</a>
                <a href="\${htmlFile}">
                  <h3 class="post-title">\${data.title}</h3>
                </a>
                <div class="post-meta">By AI Editor • \${dateStr}</div>
                <p class="post-excerpt">\${data.excerpt}</p>
              </div>
            </article>
            <!-- NEW_ARTICLE_ANCHOR -->\`;

        indexContent = indexContent.replace('<!-- NEW_ARTICLE_ANCHOR -->', cardHtml);

        const trendingHtml = \`
            <li>
              <a href="\${data.category.toLowerCase().replace(' ', '-')}.html" class="post-category">\${data.category}</a>
              <a href="\${htmlFile}" class="trending-title">\${data.title}</a>
              <span class="post-meta">Just now</span>
            </li>
            <!-- NEW_TRENDING_ANCHOR -->\`;
            
        indexContent = indexContent.replace('<!-- NEW_TRENDING_ANCHOR -->', trendingHtml);
        
        fs.writeFileSync('index.html', indexContent);
        
        execSync('git add .');
        execSync(\`git commit -m "Auto-published article: \${data.title}"\`);
        execSync('git push -u origin main');
        
        res.json({ success: true, message: "Published: " + data.title });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message || "Failed to generate or publish." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(\`Admin Panel is running!\`);
    console.log(\`Open http://localhost:\${PORT} in your browser to access the dashboard.\`);
});
