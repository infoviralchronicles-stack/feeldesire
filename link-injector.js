const fs = require('fs');
const path = require('path');

// Manually curated mapping of core SEO topics and natural anchor keywords for site articles
const TOPIC_REGISTRY = [
    {
        "href": "ultimate-guide-to-healthy-morning-breakfast-recipes-for-vitality.html",
        "category": "Food",
        "keywords": [
            "healthy morning breakfast recipes",
            "healthy breakfast recipes",
            "morning breakfast recipes",
            "morning nutrition",
            "healthy morning breakfast"
        ]
    },
    {
        "href": "ultimate-vacation-guide-to-the-top-travel-destinations-around-the-globe.html",
        "category": "Travel",
        "keywords": [
            "top travel destinations",
            "vacation destinations",
            "travel destinations",
            "vacation guide",
            "travel planning"
        ]
    },
    {
        "href": "how-to-start-a-travel-blog-and-build-a-successful-digital-business.html",
        "category": "Travel",
        "keywords": [
            "start a travel blog",
            "travel blog",
            "digital business",
            "monetization strategies",
            "travel blogging"
        ]
    },
    {
        "href": "the-ultimate-guide-to-finding-the-best-noise-cancelling-headphones.html",
        "category": "Travel",
        "keywords": [
            "best noise cancelling headphones",
            "noise cancelling headphones",
            "auditory comfort",
            "audio quality",
            "headphones"
        ]
    },
    {
        "href": "the-ultimate-guide-to-choosing-the-perfect-laptop-for-work-and-gaming.html",
        "category": "Technology",
        "keywords": [
            "laptop for work and gaming",
            "gaming laptop",
            "work laptop",
            "laptop setups",
            "choosing the perfect laptop"
        ]
    },
    {
        "href": "ultimate-guide-to-booking-chicago-to-houston-flights-airlines-airports-and-deals.html",
        "category": "Travel",
        "keywords": [
            "chicago to houston flights",
            "booking flights",
            "airline options",
            "direct flights",
            "flight deals"
        ]
    },
    {
        "href": "the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html",
        "category": "Technology",
        "keywords": [
            "smart home gadgets",
            "smart home devices",
            "home automation",
            "modern living gadgets"
        ]
    }
];

function getAvailableArticles(currentSlug) {
    return TOPIC_REGISTRY.filter(item => {
        const itemSlug = item.href.replace('.html', '');
        return itemSlug !== currentSlug;
    });
}

// Naturally inject internal links directly into relevant keywords in body text
function injectNaturalInternalLinks(htmlBody, currentSlug, currentCategory) {
    const candidates = getAvailableArticles(currentSlug);
    if (candidates.length === 0) return htmlBody;

    // Prioritize candidates in same category or adjacent category
    candidates.sort((a, b) => {
        const aCat = (a.category && a.category.toLowerCase() === (currentCategory || '').toLowerCase()) ? 2 : 0;
        const bCat = (b.category && b.category.toLowerCase() === (currentCategory || '').toLowerCase()) ? 2 : 0;
        return bCat - aCat;
    });

    let modifiedHtml = htmlBody;
    let linksInjected = 0;
    const maxLinks = 2; // Best SEO practice: 2 high-quality contextual links per article
    const usedHrefs = new Set();

    // Iterate through paragraphs
    const pRegex = /<p>([\s\S]*?)<\/p>/g;
    const paragraphs = [];
    let pMatch;
    while ((pMatch = pRegex.exec(htmlBody)) !== null) {
        paragraphs.push(pMatch[0]);
    }

    for (let p of paragraphs) {
        if (linksInjected >= maxLinks) break;
        // Don't inject in paragraphs that already contain links or the bolded main keyword
        if (p.includes('<a ') || p.includes('<strong>')) continue;

        for (const article of candidates) {
            if (usedHrefs.has(article.href)) continue;

            let matched = false;
            // Sort keywords longest first to match full phrases
            const sortedKw = [...article.keywords].sort((a, b) => b.length - a.length);

            for (const kw of sortedKw) {
                // Word boundary check, case-insensitive
                const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const wordRx = new RegExp(`\\b(${escaped})\\b`, 'i');

                if (wordRx.test(p)) {
                    const cleanHref = article.href.replace(/\.html$/, '');
                    const newP = p.replace(wordRx, `<a href="${cleanHref}" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">$1</a>`);
                    if (newP !== p) {
                        modifiedHtml = modifiedHtml.replace(p, newP);
                        usedHrefs.add(article.href);
                        linksInjected++;
                        matched = true;
                        break;
                    }
                }
            }
            if (matched) break;
        }
    }

    return modifiedHtml;
}

module.exports = { injectNaturalInternalLinks, getAvailableArticles, TOPIC_REGISTRY };
