const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\Users\\Lapzone.pk\\Desktop\\website new';
const siteUrl = 'https://feeldesire.com';
const currentDate = new Date().toISOString().split('T')[0];

const excludedFiles = [
    'admin.html',
    'find-by-name-output.txt'
];

const categorySlugs = [
    'lifestyle',
    'entertainment',
    'technology',
    'health',
    'travel',
    'business',
    'fashion',
    'food',
    'trending-news'
];

const staticPages = [
    'about-us',
    'our-story',
    'contact',
    'advertise',
    'privacy-policy'
];

const authorSlugs = [
    'author-alex-mercer',
    'author-david-thorne',
    'author-emma-collins'
];

const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html'));

const urlEntries = [];

// 1. Homepage
urlEntries.push(`  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

// 2. Categories
categorySlugs.forEach(slug => {
    urlEntries.push(`  <url>
    <loc>${siteUrl}/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
});

// 3. Static Pages
staticPages.forEach(slug => {
    urlEntries.push(`  <url>
    <loc>${siteUrl}/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
});

// 4. Authors
authorSlugs.forEach(slug => {
    urlEntries.push(`  <url>
    <loc>${siteUrl}/${slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
});

// 5. Articles
files.forEach(file => {
    const slug = file.replace('.html', '');
    if (slug === 'index' || categorySlugs.includes(slug) || staticPages.includes(slug) || authorSlugs.includes(slug) || excludedFiles.includes(file)) {
        return;
    }

    const stat = fs.statSync(path.join(baseDir, file));
    const modDate = stat.mtime.toISOString().split('T')[0];

    urlEntries.push(`  <url>
    <loc>${siteUrl}/${slug}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
});

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(baseDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`Successfully generated sitemap.xml with ${urlEntries.length} URLs.`);
