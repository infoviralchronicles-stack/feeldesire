const fs = require('fs');
const path = require('path');

// Manually curated mapping of core SEO topics and natural anchor keywords for site articles
const TOPIC_REGISTRY = [
    {
        "href": "smart-ways-a-trip-and-vacation-can-save-you-time-and-money.html",
        "category": "Travel",
        "title": "Smart Ways a Trip and Vacation Can Save You Time and Money",
        "keywords": [
            "vacation savings",
            "save time and money on vacation",
            "trip and vacation",
            "travel budget",
            "planning a trip",
            "leisure getaways",
            "vacation modes"
        ]
    },
    {
        "href": "how-24-7-emergency-travel-support-protects-international-travelers.html",
        "category": "Travel",
        "title": "How 24/7 Emergency Travel Support Protects International Travelers",
        "keywords": [
            "24 7 emergency travel support",
            "emergency travel support",
            "travel support services",
            "emergency assistance for travelers",
            "international travel emergencies",
            "travel assistance",
            "travel insurance",
            "emergency travel assistance",
            "emergency travel"
        ]
    },
    {
        "href": "why-booking-with-a-travel-co-can-transform-your-next-vacation.html",
        "category": "Travel",
        "title": "Why Booking With a Travel Co Can Transform Your Next Vacation",
        "keywords": [
            "booking with a travel company",
            "booking with a travel co",
            "transform your next vacation",
            "professional travel planners",
            "dedicated travel agency",
            "planning a vacation",
            "vacation planning",
            "travel companions",
            "travel agency"
        ]
    },
    {
        "href": "ultimate-vacation-guide-to-the-top-travel-destinations-around-the-globe.html",
        "category": "Travel",
        "title": "Ultimate Vacation Guide to the Top Travel Destinations Around the Globe",
        "keywords": [
            "top travel destinations",
            "vacation destinations around the globe",
            "vacation destinations",
            "global travel destinations",
            "international vacation spots",
            "travel destinations",
            "new destinations",
            "popular destinations",
            "popular travel destinations"
        ]
    },
    {
        "href": "how-to-start-a-travel-blog-and-build-a-successful-digital-business.html",
        "category": "Travel",
        "title": "How to Start a Travel Blog and Build a Successful Digital Business",
        "keywords": [
            "start a travel blog",
            "building a travel blog",
            "successful digital business",
            "travel blogging career",
            "travel blog",
            "travel blogging",
            "digital business"
        ]
    },
    {
        "href": "ultimate-guide-to-booking-chicago-to-houston-flights-airlines-airports-and-deals.html",
        "category": "Travel",
        "title": "Ultimate Guide to Booking Chicago to Houston Flights: Airlines, Airports, and Deals",
        "keywords": [
            "chicago to houston flights",
            "booking domestic flights",
            "booking flights",
            "airline deals and tickets",
            "flight booking",
            "flight discounts"
        ]
    },
    {
        "href": "the-ultimate-guide-to-finding-the-best-noise-cancelling-headphones.html",
        "category": "Technology",
        "title": "The Ultimate Guide to Finding the Best Noise Cancelling Headphones",
        "keywords": [
            "best noise cancelling headphones",
            "noise cancelling headphones",
            "wireless audio headphones",
            "travel headphones",
            "audio equipment",
            "audio gear",
            "headphones"
        ]
    },
    {
        "href": "the-ultimate-guide-to-choosing-the-perfect-laptop-for-work-and-gaming.html",
        "category": "Technology",
        "title": "The Ultimate Guide to Choosing the Perfect Laptop for Work and Gaming",
        "keywords": [
            "laptop for work and gaming",
            "choosing the perfect laptop",
            "portable work laptop",
            "high performance laptops",
            "laptops",
            "laptop"
        ]
    },
    {
        "href": "the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html",
        "category": "Technology",
        "title": "The Ultimate Guide to Smart Home Gadgets: Elevating Modern Living",
        "keywords": [
            "smart home gadgets",
            "modern smart home devices",
            "elevating modern living",
            "smart home technology",
            "smart home devices",
            "smart home"
        ]
    },
    {
        "href": "ultimate-guide-to-healthy-morning-breakfast-recipes-for-vitality.html",
        "category": "Food",
        "title": "Ultimate Guide to Healthy Morning Breakfast Recipes for Vitality",
        "keywords": [
            "healthy morning breakfast recipes",
            "healthy morning breakfast",
            "nutritious breakfast ideas",
            "healthy breakfast recipes",
            "morning breakfast",
            "breakfast recipes",
            "breakfast"
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

    // Detect existing internal links
    const existingLinkMatches = htmlBody.match(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g) || [];
    const usedHrefs = new Set();
    existingLinkMatches.forEach(tag => {
        const m = tag.match(/href="([^"]+)"/);
        if (m) {
            const clean = m[1].replace(/\.html$/, '');
            usedHrefs.add(clean);
            usedHrefs.add(clean + '.html');
        }
    });

    let linksInjected = 0;
    const maxLinks = 2; // Target: 2 high-quality contextual links per article
    const linksNeeded = Math.max(0, maxLinks - existingLinkMatches.length);
    if (linksNeeded <= 0) return htmlBody;

    let modifiedHtml = htmlBody;
    const pRegex = /<p>([\s\S]*?)<\/p>/g;
    const paragraphs = [];
    let pMatch;
    while ((pMatch = pRegex.exec(htmlBody)) !== null) {
        paragraphs.push(pMatch[0]);
    }

    // Pass 1: Natural keyword matching (seamlessly converts mentioned phrases or bolded topic phrases into natural links)
    for (let p of paragraphs) {
        if (linksInjected >= linksNeeded) break;
        // Don't inject in paragraphs that already contain links or the primary article focus keyword
        if (p.includes('<a ')) continue;
        // Skip intro if it has the bolded focus keyword of the current article
        if (p === paragraphs[0] && p.includes('<strong>')) continue;

        for (const article of candidates) {
            if (usedHrefs.has(article.href) || usedHrefs.has(article.href.replace(/\.html$/, ''))) continue;

            let matched = false;
            // Sort keywords longest first to match full phrases
            const sortedKw = [...article.keywords].sort((a, b) => b.length - a.length);

            for (const kw of sortedKw) {
                const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Support both plain text phrase and <strong>phrase</strong>
                const strongRx = new RegExp(`<strong>(${escaped})</strong>`, 'i');
                const wordRx = new RegExp(`\\b(${escaped})\\b`, 'i');
                const cleanHref = article.href.replace(/\.html$/, '');

                if (strongRx.test(p)) {
                    const newP = p.replace(strongRx, `<a href="${cleanHref}" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">$1</a>`);
                    if (newP !== p && modifiedHtml.includes(p)) {
                        modifiedHtml = modifiedHtml.replace(p, newP);
                        usedHrefs.add(article.href);
                        usedHrefs.add(cleanHref);
                        linksInjected++;
                        matched = true;
                        break;
                    }
                } else if (wordRx.test(p)) {
                    const newP = p.replace(wordRx, `<a href="${cleanHref}" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">$1</a>`);
                    if (newP !== p && modifiedHtml.includes(p)) {
                        modifiedHtml = modifiedHtml.replace(p, newP);
                        usedHrefs.add(article.href);
                        usedHrefs.add(cleanHref);
                        linksInjected++;
                        matched = true;
                        break;
                    }
                }
            }
            if (matched) break;
        }
    }

    // Pass 2: Contextual fallback if still under target links (in natural flowing editorial style)
    if (linksInjected < linksNeeded) {
        for (let i = 0; i < paragraphs.length; i++) {
            if (linksInjected >= linksNeeded) break;
            const p = paragraphs[i];
            // Only inject in middle paragraphs without links or headers/FAQs/Pros
            if (i < 2 || p.includes('<a ') || p.includes('FAQ') || p.includes('Pros:') || p.includes('Cons:')) continue;

            for (const article of candidates) {
                if (usedHrefs.has(article.href) || usedHrefs.has(article.href.replace(/\.html$/, ''))) continue;

                const cleanHref = article.href.replace(/\.html$/, '');
                const naturalAnchor = article.keywords[0] || article.title.toLowerCase();
                const contextualSentence = ` When coordinating your itinerary, understanding <a href="${cleanHref}" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">${naturalAnchor}</a> ensures you maximize every stage of your journey.`;
                const newP = p.replace(/<\/p>$/, `${contextualSentence}</p>`);
                if (newP !== p && modifiedHtml.includes(p)) {
                    modifiedHtml = modifiedHtml.replace(p, newP);
                    usedHrefs.add(article.href);
                    usedHrefs.add(cleanHref);
                    linksInjected++;
                    break;
                }
            }
        }
    }

    return modifiedHtml;
}

module.exports = { injectNaturalInternalLinks, getAvailableArticles, TOPIC_REGISTRY };

