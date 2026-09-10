const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const techCss = `
/* =========================================
   TECH-NEW-AUTO THEME OVERRIDES
   ========================================= */
:root {
  --primary-color: #2563eb;
  --primary-blue: #2563eb;
  --dark-blue: #1d4ed8;
  --accent-cyan: #06b6d4;
  --bg-color: #f8fafc;
  --card-light: #fff;
  --border-color: #e2e8f0;
  --text-dark: #0f172a;
  --font-heading: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

body {
  background-color: var(--bg-color);
  color: var(--text-dark);
}

/* Header Tech Style */
header {
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.header-top {
  padding: 15px 20px;
}
.header-top .logo {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 2.2rem;
  letter-spacing: -0.5px;
  text-transform: none;
  color: var(--text-dark);
}
.header-top .logo span {
  color: var(--primary-blue);
  font-style: normal;
}

.main-nav {
  border: none;
  background: var(--dark-blue);
  padding: 0;
}
.main-nav ul {
  gap: 0;
}
.main-nav a {
  color: #fff;
  padding: 15px 20px;
  display: block;
  font-size: 0.95rem;
  letter-spacing: 0;
  text-transform: none;
  font-weight: 500;
  border-right: 1px solid rgba(255,255,255,0.1);
}
.main-nav a:hover {
  background: rgba(255,255,255,0.1);
  color: #fff;
}
.main-nav li:first-child a { border-left: 1px solid rgba(255,255,255,0.1); }

/* Tech Cards */
.post-card {
  background: var(--card-light);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05) !important;
  padding-bottom: 0;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1) !important;
}
.post-img-wrapper img {
  border-radius: 12px 12px 0 0;
}
.post-content {
  padding: 20px;
}
.post-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}
.post-category {
  color: var(--primary-blue);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: inline-block;
  background: rgba(37,99,235,0.1);
  padding: 4px 10px;
  border-radius: 4px;
}
.post-meta {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}
.post-excerpt {
  color: #475569;
  font-size: 0.95rem;
}

/* Tech Section Titles */
.section-title {
  text-align: left;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  margin-bottom: 25px;
  border-bottom: 2px solid var(--primary-blue);
  position: relative;
  display: block;
  text-transform: uppercase;
}
.section-title::after { display: none; }
.section-title span.tag-box {
  background: linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 50%, #0284c7 100%);
  color: #fff;
  padding: 8px 18px;
  border-radius: 6px 6px 0 0;
  display: inline-block;
  font-weight: 800;
  box-shadow: 0 2px 4px rgba(37,99,235,0.2);
}

/* Sidebar Update */
.sidebar {
  border-left: none;
  padding-left: 0;
}
.sidebar-widget {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.widget-title {
  font-size: 1.1rem;
  border-bottom: 2px solid var(--primary-blue);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 0;
}
.widget-title span.tag-box {
  background: linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 50%, #0284c7 100%);
  color: #fff;
  padding: 6px 14px;
  border-radius: 6px 6px 0 0;
  display: inline-block;
}
.trending-list li {
  border-bottom: 1px solid var(--border-color);
}
.sidebar-thumbnail {
  border-radius: 6px;
  border: none;
}

/* Reset Dark Section */
.section-dark {
  background: var(--card-light);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  color: var(--text-dark);
}
.section-dark .section-title { color: var(--text-dark); border-bottom-color: var(--primary-blue); }
.section-dark .post-card { background: #fff; border: 1px solid var(--border-color); box-shadow: none !important; }
.section-dark .post-title, .section-dark .post-excerpt, .section-dark .post-meta { color: var(--text-dark); }
.section-dark .post-excerpt { color: #475569; }
`;

// Remove the previous magazine overrides
css = css.split('/* =========================================\n   MAGAZINE THEME OVERRIDES')[0];
fs.writeFileSync('style.css', css.trim() + '\n\n' + techCss);

// 2. Update index.html to wrap section titles in the span.tag-box so they match the CSS
let html = fs.readFileSync('index.html', 'utf8');

// Replace standard <h2 class="section-title">TITLE</h2> with <h2 class="section-title"><span class="tag-box">TITLE</span></h2>
html = html.replace(/<h2 class="section-title">([^<]+)<\/h2>/g, '<h2 class="section-title"><span class="tag-box">$1</span></h2>');
html = html.replace(/<h3 class="widget-title">([^<]+)<\/h3>/g, '<h3 class="widget-title"><span class="tag-box">$1</span></h3>');

fs.writeFileSync('index.html', html);
console.log("Tech Theme applied!");
