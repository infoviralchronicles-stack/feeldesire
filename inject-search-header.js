const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const searchFormHtml = `        <div class="header-actions">
          <div class="site-search-wrapper">
            <form class="site-search-form" action="search.html" method="get">
              <input type="search" name="q" class="site-search-input" placeholder="Search stories..." aria-label="Search articles" autocomplete="off">
              <button type="submit" class="site-search-btn" aria-label="Submit search">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>
            <div class="search-results-dropdown"></div>
          </div>
          <button class="mobile-menu-btn" aria-label="Toggle Navigation">&#9776;</button>
        </div>`;

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html'));
let updatedCount = 0;

for (const file of files) {
    if (file === 'admin.html' || file === 'search.html') continue;
    
    const filePath = path.join(baseDir, file);
    let html = fs.readFileSync(filePath, 'utf8');

    // Check if header-actions already present
    if (html.includes('header-actions')) continue;

    // Pattern 1: <button class="mobile-menu-btn" ... </button>
    const buttonRegex = /<button\s+class="mobile-menu-btn"[^>]*>[\s\S]*?<\/button>/i;
    if (buttonRegex.test(html)) {
        html = html.replace(buttonRegex, searchFormHtml);
        fs.writeFileSync(filePath, html, 'utf8');
        updatedCount++;
    } else {
        // Pattern 2: just inside header-top if no mobile-menu-btn
        const headerTopEnd = /<\/div>\s*<\/div>\s*<nav class="main-nav">/i;
        if (headerTopEnd.test(html)) {
            html = html.replace(headerTopEnd, `${searchFormHtml}\n      </div>\n    </div>\n    <nav class="main-nav">`);
            fs.writeFileSync(filePath, html, 'utf8');
            updatedCount++;
        }
    }
}

console.log(`Updated ${updatedCount} HTML files with header search bar.`);
