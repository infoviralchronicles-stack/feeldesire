const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const cardRx = /<article class="post-card">([\s\S]*?)<\/article>/g;
const articles = [];
let cm;

while ((cm = cardRx.exec(indexHtml)) !== null) {
    const cardContent = cm[1];
    const hrefMatch = cardContent.match(/<a\s+href="([^"]+)"\s+class="post-img-wrapper"/);
    const catMatch = cardContent.match(/class="post-category">([^<]+)<\/a>/);
    const titleMatch = cardContent.match(/<h3\s+class="post-title">([^<]+)<\/h3>/);
    const excerptMatch = cardContent.match(/<p\s+class="post-excerpt">([^<]+)<\/p>/);

    if (hrefMatch && titleMatch) {
        articles.push({
            slug: hrefMatch[1].replace(/\.html$/, ''),
            category: catMatch ? catMatch[1].trim() : 'General',
            title: titleMatch[1].trim(),
            excerpt: excerptMatch ? excerptMatch[1].trim() : ''
        });
    }
}

const siteUrl = 'https://www.feeldesire.com';

const categories = [
    { name: 'Lifestyle', slug: 'lifestyle', desc: 'Home ergonomics, daily wellness rituals, interior design, and modern mindful living.' },
    { name: 'Technology', slug: 'technology', desc: 'Hardware reviews, smart home automation, consumer electronics, and computing innovations.' },
    { name: 'Travel', slug: 'travel', desc: 'Global destination itineraries, flight booking strategies, travel gear guides, and digital nomad advice.' },
    { name: 'Food', slug: 'food', desc: 'Morning vitality recipes, clean nutrition frameworks, and wholesome culinary guides.' },
    { name: 'Entertainment', slug: 'entertainment', desc: 'Cinema analysis, streaming platform curation, and contemporary cultural discourse.' },
    { name: 'Health', slug: 'health', desc: 'Evidence-based longevity strategies, fitness regimens, and mindful health habits.' },
    { name: 'Business', slug: 'business', desc: 'Digital entrepreneurship, creator economy strategies, and market perspectives.' },
    { name: 'Fashion', slug: 'fashion', desc: 'Sustainable style movements, capsule wardrobing, and trend forecasts.' },
    { name: 'Trending News', slug: 'trending-news', desc: 'Developing cultural stories and high-impact international topics.' }
];

let llmsContent = `# FeelDesire

> FeelDesire is a premier modern digital publication providing high-depth journalism, expert buyer guides, technology breakdowns, wellness rituals, and cultural investigations.

## Core Categories
${categories.map(c => `- [${c.name}](${siteUrl}/${c.slug}): ${c.desc}`).join('\n')}

## Published Articles & Knowledge Base
${articles.map(a => `- [${a.title}](${siteUrl}/${a.slug}): ${a.excerpt}`).join('\n')}

## Editorial Leadership
- [Alex Mercer](${siteUrl}/author-alex-mercer): Culture, entertainment economics, digital media analysis, and technology correspondent.
- [David Thorne](${siteUrl}/author-david-thorne): Senior technology reporter, AI infrastructure researcher, hardware evaluation specialist.
- [Emma Collins](${siteUrl}/author-emma-collins): Senior lifestyle editor, sustainable architecture specialist, circadian wellness writer.

## Publication Metadata
- Canonical Domain: ${siteUrl}
- XML Sitemap: ${siteUrl}/sitemap.xml
- License: All original editorial content is published by FeelDesire Media.
`;

fs.writeFileSync('llms.txt', llmsContent, 'utf8');
console.log(`Successfully generated comprehensive llms.txt with all ${articles.length} published articles.`);
