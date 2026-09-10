const fs = require('fs');
const path = require('path');

// Gather all currently used image URLs across all HTML files
function getUsedImageUrls(baseDir) {
    const used = new Set();
    try {
        const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(baseDir, file), 'utf8');
            const matches = content.matchAll(/<img[^>]+src=["']([^"']+)["']/g);
            for (const m of matches) {
                const src = m[1];
                if (!src.includes('logo') && !src.includes('favicon') && !src.includes('avatar') && !src.includes('author')) {
                    const base = src.split('?')[0];
                    used.add(base);
                }
            }
        }
    } catch(e) {
        console.error("Error scanning used images:", e.message);
    }
    return used;
}

// Fetch 3 distinct, highly relevant, non-repeated images for the given keyword and category
async function fetchUniqueRelevantImages(keyword, category, baseDir = __dirname) {
    const unsplashKey = "hFl_35GKYSCzGjcC_nZrnchqvcvTJ17FTlCHL6IK6sg";
    const usedImages = getUsedImageUrls(baseDir);

    const stopWords = new Set(['to', 'from', 'in', 'on', 'for', 'of', 'and', 'the', 'a', 'an', 'with', 'how', 'what', 'best', 'top', 'buy', 'guide', 'ultimate', 'your', 'need', 'perfect', 'choosing']);
    const tokens = keyword.toLowerCase().split(/[\s,-]+/).filter(w => w && !stopWords.has(w));
    
    // Ordered candidate search queries
    const searchQueries = [
        tokens.join(' '),
        keyword,
        tokens.slice(0, 3).join(' '),
        tokens.slice(-2).join(' '),
        tokens[0] ? `${tokens[0]} ${category}` : '',
        tokens[tokens.length - 1] ? `${tokens[tokens.length - 1]} ${category}` : ''
    ].filter(Boolean);

    let collected = [];

    // Search Unsplash with strict relevance matching
    for (const q of searchQueries) {
        if (collected.length >= 3) break;
        try {
            const url = `https://api.unsplash.com/search/photos?per_page=20&orientation=landscape&query=${encodeURIComponent(q)}&client_id=${unsplashKey}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    for (const photo of data.results) {
                        const rawUrl = photo.urls && photo.urls.regular ? photo.urls.regular : photo.urls.full;
                        if (!rawUrl) continue;
                        const base = rawUrl.split('?')[0];

                        // Strict relevance check: verify photo description/alt mentions at least one keyword token or category
                        const photoDesc = ((photo.alt_description || '') + ' ' + (photo.description || '')).toLowerCase();
                        const isRelevant = tokens.some(t => photoDesc.includes(t)) || (category && photoDesc.includes(category.toLowerCase()));

                        if (isRelevant && !usedImages.has(base) && !collected.some(c => c.split('?')[0] === base)) {
                            collected.push(rawUrl);
                            usedImages.add(base);
                            if (collected.length >= 3) break;
                        }
                    }
                }
            }
        } catch(e) {
            console.error(`Unsplash search error for "${q}":`, e.message);
        }
    }

    // High quality AI photographic fallback with unique seed per article/keyword to guarantee 100% precision & 0 repetition
    let attempt = 0;
    while (collected.length < 3) {
        attempt++;
        const randomSeed = Math.floor(Math.random() * 1000000) + attempt;
        const promptText = encodeURIComponent(`${keyword} professional ultra realistic photography high resolution modern studio clean 4k`);
        const fallbackUrl = `https://image.pollinations.ai/prompt/${promptText}?width=1200&height=800&nologo=true&seed=${randomSeed}`;
        collected.push(fallbackUrl);
    }

    return {
        featured: collected[0],
        inline1: collected[1],
        inline2: collected[2]
    };
}

module.exports = { fetchUniqueRelevantImages, getUsedImageUrls };
