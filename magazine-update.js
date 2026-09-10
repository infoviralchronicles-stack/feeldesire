const fs = require('fs');
const path = require('path');

// 1. Update style.css
let css = fs.readFileSync('style.css', 'utf8');

const magazineCss = `
/* =========================================
   MAGAZINE THEME OVERRIDES
   ========================================= */
:root {
  --primary-color: #d90429; /* Editorial Red */
  --bg-color: #fdfdfd; /* Off-white paper look */
  --text-color: #111;
  --font-heading: 'Playfair Display', serif;
}

/* Header Magazine Style */
header {
  background: var(--bg-color);
  box-shadow: none;
  border-bottom: 1px solid #000;
  padding: 0;
}
.header-top {
  justify-content: center;
  padding: 30px 20px;
  position: relative;
}
.header-top .logo {
  font-size: 3.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #000;
}
.header-top .logo span {
  color: var(--primary-color);
  font-style: italic;
}
.header-top .search-bar {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
}

/* Navigation Magazine Style */
.main-nav {
  border-top: 1px solid #eaeaea;
  border-bottom: 2px solid #000;
  padding: 12px 0;
}
.main-nav ul {
  justify-content: center;
  gap: 30px;
}
.main-nav a {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
  color: #000;
}
.main-nav a:hover {
  color: var(--primary-color);
}

/* Flat Editorial Cards (No Shadows, Sharp Corners) */
.post-card {
  box-shadow: none !important;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 20px;
  margin-bottom: 30px;
  background: transparent;
  transition: none;
}
.post-card:hover {
  transform: none;
}
.post-img-wrapper img {
  border-radius: 0;
}
.post-title {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 10px;
}
.post-category {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--primary-color);
  font-weight: 700;
}
.post-meta {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.post-excerpt {
  font-size: 1rem;
  line-height: 1.6;
  color: #444;
  font-family: 'Inter', sans-serif;
}

/* Sidebar Magazine Style */
.sidebar {
  border-left: 1px solid #eaeaea;
  padding-left: 30px;
}
.widget-title {
  font-family: var(--font-heading);
  font-size: 1.4rem;
  text-transform: uppercase;
  border-bottom: 2px solid #000;
  padding-bottom: 10px;
  margin-bottom: 20px;
  color: #000;
}
.trending-list li {
  border-bottom: 1px solid #eaeaea;
}
.trending-list li .trending-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
}
.sidebar-thumbnail {
  border-radius: 0;
  border: 1px solid #eaeaea;
}

/* Section Titles */
.section-title {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  text-transform: uppercase;
  text-align: center;
  border-bottom: none;
  margin-bottom: 40px;
  position: relative;
}
.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: var(--primary-color);
  margin: 15px auto 0;
}

/* Magazine Hero Area */
.magazine-hero {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 50px;
  border-bottom: 2px solid #000;
  padding-bottom: 40px;
}
.hero-main .post-card { border-bottom: none; }
.hero-main .post-title { font-size: 2.5rem; }
.hero-side { display: flex; flex-direction: column; gap: 20px; border-left: 1px solid #eaeaea; padding-left: 20px; }
.hero-side .post-card { margin-bottom: 0; padding-bottom: 15px; }
.hero-side .post-img-wrapper { height: 150px; }
.hero-side .post-title { font-size: 1.2rem; }

@media (max-width: 992px) {
  .magazine-hero { grid-template-columns: 1fr; }
  .hero-side { border-left: none; padding-left: 0; border-top: 1px solid #eaeaea; padding-top: 20px; }
  .header-top .logo { font-size: 2.5rem; }
  .header-top .search-bar { display: none; } /* Hide admin button on mobile to save space */
  .sidebar { border-left: none; padding-left: 0; }
}
`;

if (!css.includes('MAGAZINE THEME OVERRIDES')) {
    fs.writeFileSync('style.css', css + '\n' + magazineCss);
}

// 2. We don't need to change the HTML structure of EVERY page, 
// The CSS overrides (like removing shadows, centering logo, sharp corners) will instantly apply a magazine feel to all pages.
// But we should update index.html to have a more editorial layout.
console.log("CSS updated for Magazine Style.");
