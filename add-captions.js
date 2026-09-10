const fs = require('fs');

// 1. Wrap all inline article body images with <figure> and <figcaption> using their alt text
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'admin.html'
    && !['lifestyle.html','technology.html','entertainment.html','health.html','travel.html','business.html','fashion.html','food.html','trending-news.html','our-story.html','contact.html','advertise.html','privacy-policy.html','about-us.html'].includes(f)
);

let updated = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('<figcaption>')) return; // already done

    // Match inline images inside article-body (NOT inside post-img-wrapper or article-featured-image)
    // Pattern: standalone <img with style and alt, not wrapped in <a> or <div class="article-featured-image">
    content = content.replace(/<img src="([^"]+)" style="([^"]*)" alt="([^"]*)">/g, (match, src, style, alt) => {
        if (!alt || alt.length < 3) return match;
        // Capitalize alt text for headline
        const caption = alt.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return `<figure style="margin: 30px 0; text-align: center;">
<img src="${src}" style="${style}" alt="${alt}">
<figcaption style="font-size: 14px; color: #555; margin-top: 10px; font-weight: 600; font-style: italic;">${caption}</figcaption>
</figure>`;
    });

    fs.writeFileSync(file, content);
    updated++;
});

// 2. Add figcaption CSS to style.css
let css = fs.readFileSync('style.css', 'utf8');
if (!css.includes('.article-body figure')) {
    css += `
/* Image Captions */
.article-body figure {
  margin: 30px 0;
  text-align: center;
}
.article-body figcaption {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
  font-weight: 600;
  font-style: italic;
  line-height: 1.5;
}
`;
    fs.writeFileSync('style.css', css);
}

console.log(`Added image captions to ${updated} article pages`);
