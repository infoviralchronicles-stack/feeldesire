require('dotenv').config();
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Please set GEMINI_API_KEY in .env");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// --- SERVE THE WORDPRESS UI ---
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FeelDesire Local WordPress Panel</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
  <style>
    :root { --sidebar-bg: #1e293b; --sidebar-hover: #334155; --primary: #3b82f6; --primary-hover: #2563eb; --bg: #f8fafc; --text: #334155; --border: #e2e8f0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background-color: var(--bg); color: var(--text); display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 260px; background-color: var(--sidebar-bg); color: white; display: flex; flex-direction: column; }
    .sidebar-header { padding: 20px; font-size: 20px; font-weight: 700; border-bottom: 1px solid #334155; display: flex; align-items: center; gap: 10px; }
    .sidebar-header span { color: #38bdf8; }
    .nav-list { list-style: none; padding: 15px 0; flex: 1; }
    .nav-item { padding: 12px 20px; cursor: pointer; display: flex; align-items: center; gap: 12px; font-weight: 500; transition: 0.2s; color: #cbd5e1; }
    .nav-item:hover, .nav-item.active { background-color: var(--sidebar-hover); color: white; border-left: 4px solid var(--primary); }
    .main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
    .topbar { background: white; padding: 15px 30px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .topbar h2 { font-size: 18px; font-weight: 600; }
    .content-area { padding: 30px; max-width: 1000px; width: 100%; margin: 0 auto; }
    .section { display: none; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 30px; border: 1px solid var(--border); }
    .section.active { display: block; }
    .section-title { font-size: 22px; font-weight: 600; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid var(--border); }
    .form-group { margin-bottom: 20px; }
    label { display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px; }
    input[type="text"], select { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; outline: none; transition: 0.2s; font-family: inherit; }
    input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; background-color: var(--primary); color: white; border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn:hover { background-color: var(--primary-hover); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-secondary { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    #editor-container { height: 400px; font-size: 16px; font-family: 'Inter', sans-serif; border-radius: 0 0 6px 6px; border-color: #cbd5e1; }
    .ql-toolbar.ql-snow { border-color: #cbd5e1; border-radius: 6px 6px 0 0; background: #f8fafc; padding: 12px; }
    #log { margin-top: 25px; padding: 15px; background: #f1f5f9; color: #334155; border-left: 4px solid var(--primary); border-radius: 4px; font-family: monospace; font-size: 13px; max-height: 200px; overflow-y: auto; display: none; }
    .log-success { border-left-color: #10b981 !important; color: #047857 !important; background: #ecfdf5 !important; }
    .log-error { border-left-color: #ef4444 !important; color: #b91c1c !important; background: #fef2f2 !important; }
  </style>
</head>
<body>
  <aside class="sidebar">
    <div class="sidebar-header">W <span>FeelDesire</span></div>
    <ul class="nav-list">
      <li class="nav-item active" onclick="switchTab('tab-publish', this)"><span>✨</span> AI Publish</li>
      <li class="nav-item" onclick="switchTab('tab-edit', this); loadArticlesList();"><span>📝</span> All Articles</li>
    </ul>
  </aside>
  <main class="main">
    <div class="topbar"><h2 id="topbar-title">AI Publish</h2></div>
    <div class="content-area">
      
      <!-- AI Publish -->
      <div id="tab-publish" class="section active">
        <h3 class="section-title">Write New Post with AI</h3>
        <div class="form-group">
          <label>Enter Topic or Keyword</label>
          <input type="text" id="keyword" placeholder="e.g., Best Smartphones of 2026" style="font-size:18px; padding:15px;">
        </div>
        <button id="publishBtn" class="btn" style="width:100%; padding:15px; font-size:16px;" onclick="startPublishing()">Generate & Publish Automatically</button>
      </div>

      <!-- Edit -->
      <div id="tab-edit" class="section">
        <h3 class="section-title">Edit Existing Articles</h3>
        <div class="form-group" style="display:flex; gap:10px;">
          <select id="articleSelect" onchange="loadArticleContent()" style="flex:1;"><option value="">-- Select an Article --</option></select>
          <button class="btn btn-secondary" onclick="loadArticlesList()">Refresh</button>
        </div>
        <div id="editArea" style="display: none; margin-top: 30px;">
          <div class="form-group"><label>Article Title</label><input type="text" id="editTitle" style="font-size:18px; padding:15px; font-weight:600;"></div>
          <div class="form-group"><label>Content</label><div id="editor-container"></div></div>
          <button id="updateBtn" class="btn" style="padding:15px 30px;" onclick="saveEditedArticle()">Update Article</button>
        </div>
      </div>
      <div id="log"></div>
    </div>
  </main>

  <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
  <script>
    var quill = new Quill('#editor-container', { theme: 'snow', modules: { toolbar: [ [{ 'header': [2, 3, false] }], ['bold', 'italic', 'underline'], ['link', 'image', 'video'], [{'list':'ordered'},{'list':'bullet'}], ['clean'] ] } });

    function switchTab(tabId, element) {
      document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
      element.classList.add('active');
      document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
      document.getElementById(tabId).classList.add('active');
      document.getElementById('topbar-title').innerText = element.innerText.replace('✨', '').replace('📝', '').trim();
      document.getElementById('log').style.display = 'none';
    }

    function showLog(msg, type = "info") {
      const log = document.getElementById('log');
      log.style.display = 'block';
      log.className = type === 'success' ? 'log-success' : type === 'error' ? 'log-error' : '';
      log.innerText = "> " + msg;
    }

    async function startPublishing() {
      const keyword = document.getElementById('keyword').value.trim();
      if(!keyword) return showLog("Please enter a keyword.", "error");
      
      const btn = document.getElementById('publishBtn');
      btn.disabled = true; btn.innerText = "Generating & Publishing... (Takes 1-2 mins)";
      showLog("Writing article using AI...");
      
      try {
        const res = await fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyword }) });
        const data = await res.json();
        if(res.ok) {
           showLog("Success! Article is published to GitHub.", "success");
           document.getElementById('keyword').value = '';
        } else {
           showLog(data.error, "error");
        }
      } catch (err) { showLog(err.message, "error"); }
      finally { btn.disabled = false; btn.innerText = "Generate & Publish Automatically"; }
    }

    async function loadArticlesList() {
      showLog("Fetching articles...");
      try {
        const res = await fetch('/api/list');
        const files = await res.json();
        const select = document.getElementById('articleSelect');
        select.innerHTML = '<option value="">-- Select an Article to Edit --</option>';
        files.forEach(f => {
          let opt = document.createElement('option');
          opt.value = f; opt.text = f.replace('.html', '').replace(/-/g, ' ').toUpperCase();
          select.appendChild(opt);
        });
        showLog("Articles loaded.", "success");
      } catch(err) { showLog("Failed to load articles", "error"); }
    }

    async function loadArticleContent() {
      const filename = document.getElementById('articleSelect').value;
      if(!filename) { document.getElementById('editArea').style.display = 'none'; return; }
      showLog("Loading editor...");
      try {
        const res = await fetch('/api/read?file=' + filename);
        const data = await res.json();
        document.getElementById('editTitle').value = data.title;
        quill.root.innerHTML = data.body;
        document.getElementById('editArea').style.display = 'block';
        showLog("Ready to edit.", "success");
      } catch(err) { showLog("Error loading file", "error"); }
    }

    async function saveEditedArticle() {
      const filename = document.getElementById('articleSelect').value;
      const title = document.getElementById('editTitle').value;
      const body = quill.root.innerHTML;
      
      const btn = document.getElementById('updateBtn');
      btn.disabled = true; btn.innerText = "Saving & Pushing...";
      try {
        const res = await fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename, title, body }) });
        if(res.ok) showLog("Article updated and pushed to live site!", "success");
        else showLog("Error saving", "error");
      } catch(err) { showLog("Error saving", "error"); }
      finally { btn.disabled = false; btn.innerText = "Update Article"; }
    }
  </script>
</body>
</html>`);
});

// --- API ROUTES ---
app.post('/api/publish', async (req, res) => {
    try {
        const keyword = req.body.keyword;
        const prompt = `You are an expert magazine writer. Write a comprehensive, engaging article about "${keyword}".
Return ONLY a valid JSON object (no markdown formatting) with these keys:
{"title": "Catchy title", "category": "Technology", "excerpt": "1 sentence summary", "htmlContent": "HTML body (<p>, <h2>) without html/body tags"}`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        let text = response.text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(text);

        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const imageUrl = `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/1200/800`;

        // Generate HTML
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
        <a href="index.html" class="logo"><img src="logo.svg" alt="FeelDesire"></a>
      </div>
    </div>
    <nav class="main-nav">
      <div class="container">
        <ul><li><a href="lifestyle.html">Lifestyle</a></li><li><a href="technology.html">Technology</a></li></ul>
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
                <a href="${slug}.html"><h3 class="post-title">${data.title}</h3></a>
                <div class="post-meta">${dateStr}</div>
                <p class="post-excerpt">${data.excerpt}</p>
              </div>
            </article>
            <!-- NEW_ARTICLE_ANCHOR -->`;
        indexContent = indexContent.replace('<!-- NEW_ARTICLE_ANCHOR -->', cardHtml);
        fs.writeFileSync('index.html', indexContent);

        execSync('git add .');
        execSync(`git commit -m "Publish: ${data.title}"`);
        execSync('git push -u origin main');

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/list', (req, res) => {
    const ignoreList = ['index.html', 'admin.html', 'about-us.html', 'contact.html', 'privacy-policy.html', 'advertise.html', 'our-story.html', 'lifestyle.html', 'entertainment.html', 'technology.html', 'health.html', 'travel.html', 'business.html', 'fashion.html', 'food.html', 'trending-news.html'];
    const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && !ignoreList.includes(f));
    res.json(files);
});

app.get('/api/read', (req, res) => {
    const content = fs.readFileSync(req.query.file, 'utf8');
    const titleMatch = content.match(/<h1 class="article-title">(.*?)<\/h1>/);
    const bodyMatch = content.match(/<div class="article-body">([\s\S]*?)<\/div>\s*<\/article>/);
    res.json({
        title: titleMatch ? titleMatch[1] : '',
        body: bodyMatch ? bodyMatch[1] : ''
    });
});

app.post('/api/save', (req, res) => {
    try {
        let content = fs.readFileSync(req.body.filename, 'utf8');
        content = content.replace(/<h1 class="article-title">.*?<\/h1>/, `<h1 class="article-title">${req.body.title}</h1>`);
        content = content.replace(/<div class="article-body">[\s\S]*?<\/div>\s*<\/article>/, `<div class="article-body">\n        ${req.body.body}\n      </div>\n    </article>`);
        content = content.replace(/<title>.*?<\/title>/, `<title>${req.body.title} - FeelDesire</title>`);
        
        fs.writeFileSync(req.body.filename, content);
        
        execSync('git add .');
        execSync(`git commit -m "Edit: ${req.body.title}"`);
        execSync('git push -u origin main');

        res.json({ success: true });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000, () => console.log('Local CMS running on http://localhost:3000'));



