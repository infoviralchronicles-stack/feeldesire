const fs = require('fs');
const path = require('path');

// Manually curated mapping of core SEO topics and natural anchor keywords for site articles
const TOPIC_REGISTRY = [
    {
        href: 'the-ultimate-laptop-buyer-s-guide-how-to-find-your-perfect-match.html',
        category: 'Technology',
        keywords: ["laptop buyer's guide", "laptop buyers guide", "laptop buyer", "laptop models", "buying a laptop", "personal computing device"]
    },
    {
        href: 'the-ultimate-guide-to-choosing-the-perfect-laptop-for-work-and-gaming.html',
        category: 'Technology',
        keywords: ["laptop for work and gaming", "gaming laptop", "work laptop", "mobile workstations", "laptop setups"]
    },
    {
        href: 'the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html',
        category: 'Technology',
        keywords: ["smart home gadgets", "smart home devices", "home automation", "ambient temperature controls"]
    },
    {
        href: 'the-ultimate-guide-to-buy-iphone-how-to-choose-the-right-model-for-your-needs.html',
        category: 'Technology',
        keywords: ["buy iPhone", "iPhone models", "Apple smartphones", "Pro iPhone"]
    },
    {
        href: 'how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html',
        category: 'Lifestyle',
        keywords: ["smart phone", "smartphone", "mobile devices", "handheld devices"]
    },
    {
        href: 'beyond-the-bit-how-quantum-computing-is-rewriting-the-future-of-technology.html',
        category: 'Technology',
        keywords: ["quantum computing", "quantum systems", "next-generation computing"]
    },
    {
        href: 'beyond-the-chatbot-the-breakthrough-ai-innovations-defining-2026.html',
        category: 'Technology',
        keywords: ["AI innovations", "artificial intelligence", "generative AI"]
    },
    {
        href: 'the-complete-guide-to-buy-bed-furniture-that-guarantees-restful-sleep.html',
        category: 'Lifestyle',
        keywords: ["buy bed furniture", "buy bed frames", "bed frame", "supportive mattress", "sleep setups"]
    },
    {
        href: 'the-ultimate-shopping-guide-how-to-buy-bed-designs-for-dreamy-sleep.html',
        category: 'Lifestyle',
        keywords: ["buy bed designs", "bed designs", "bedroom furniture", "bedroom dimensions"]
    },
    {
        href: 'the-sanctuary-within-how-the-modern-shower-evolved-into-a-daily-spa-experience.html',
        category: 'Lifestyle',
        keywords: ["modern shower", "shower experience", "daily spa experience"]
    },
    {
        href: 'transform-your-daily-routine-the-ultimate-guide-to-upgrading-your-bathroom-shower.html',
        category: 'Lifestyle',
        keywords: ["bathroom shower upgrade", "upgrading your bathroom", "bathroom shower"]
    },
    {
        href: 'the-ultimate-guide-to-choosing-the-perfect-bathroom-sink-for-your-home.html',
        category: 'Lifestyle',
        keywords: ["bathroom sink", "choosing a bathroom sink", "sink design"]
    },
    {
        href: 'the-art-of-less-how-minimalist-living-can-unlock-your-best-life.html',
        category: 'Lifestyle',
        keywords: ["minimalist living", "minimalism", "decluttering your space"]
    },
    {
        href: 'master-your-am-5-high-impact-morning-habits-for-peak-productivity-and-peace.html',
        category: 'Lifestyle',
        keywords: ["morning habits", "morning productivity", "morning wellness"]
    },
    {
        href: 'mastering-the-sunrise-5-transformative-morning-routine-habits-for-peak-energy-and-focus.html',
        category: 'Lifestyle',
        keywords: ["morning routine", "morning routine habits", "peak energy"]
    },
    {
        href: 'ultimate-guide-to-booking-chicago-to-houston-flights-airlines-airports-and-deals.html',
        category: 'Travel',
        keywords: ["chicago to houston flights", "booking flights", "airline options", "direct flights"]
    },
    {
        href: 'marvel-s-2026-blockbuster-slate-doctor-doom-spider-man-and-the-multiverse-s-highest-stakes.html',
        category: 'Entertainment',
        keywords: ["blockbuster slate", "Marvel Cinematic Universe", "MCU blockbusters"]
    },
    {
        href: 'binge-worthy-beats-the-top-netflix-shows-you-need-to-stream-right-now.html',
        category: 'Entertainment',
        keywords: ["top Netflix shows", "streaming industry", "binge-worthy shows"]
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
