const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
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
    'privacy-policy',
    'search'
];

const authorSlugs = [
    'author-alex-mercer',
    'author-david-thorne',
    'author-emma-collins'
];

const excludedFiles = [
    'admin.html',
    'find-by-name-output.txt',
    'index.html'
];

function buildSearchIndex() {
    const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html'));
    const indexData = [];

    for (const file of files) {
        const slug = file.replace('.html', '');
        if (slug === 'index' || categorySlugs.includes(slug) || staticPages.includes(slug) || authorSlugs.includes(slug) || excludedFiles.includes(file)) {
            continue;
        }

        try {
            const html = fs.readFileSync(path.join(baseDir, file), 'utf8');
            
            // Extract Title
            const titleMatch = html.match(/<h1 class="article-title">([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
            let title = titleMatch ? titleMatch[1].replace(/ - FeelDesire.*$/i, '').trim() : slug;

            // Extract Category
            const catMatch = html.match(/<a[^>]*class="post-category"[^>]*>([\s\S]*?)<\/a>/i);
            const category = catMatch ? catMatch[1].trim() : 'General';

            // Extract Excerpt or Meta Description
            const metaMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
            let excerpt = metaMatch ? metaMatch[1].trim() : '';
            if (!excerpt) {
                const excerptP = html.match(/<p class="post-excerpt">([\s\S]*?)<\/p>/i);
                excerpt = excerptP ? excerptP[1].trim() : '';
            }

            // Extract Image URL
            const imgMatch = html.match(/<div class="article-featured-image">\s*<img[^>]*src="([^"]*)"/i) || html.match(/<img[^>]*class="[^"]*thumbnail[^"]*"[^>]*src="([^"]*)"/i);
            const image = imgMatch ? imgMatch[1] : '';

            // Extract Date
            const dateMatch = html.match(/&bull;\s*([A-Za-z]+\s+\d{1,2},\s+\d{4})/);
            const date = dateMatch ? dateMatch[1] : '';

            // Extract Author
            const authorMatch = html.match(/class="author-link">([^<]+)<\/a>/i);
            const author = authorMatch ? authorMatch[1].trim() : 'FeelDesire Staff';

            indexData.push({
                title,
                slug,
                url: slug,
                category,
                excerpt,
                image,
                date,
                author
            });
        } catch (err) {
            console.error(`Error processing ${file} for search index:`, err.message);
        }
    }

    fs.writeFileSync(path.join(baseDir, 'search-index.json'), JSON.stringify(indexData, null, 2), 'utf8');
    console.log(`[Search Index] Generated search-index.json with ${indexData.length} articles.`);
    return indexData;
}

if (require.main === module) {
    buildSearchIndex();
}

module.exports = { buildSearchIndex };
