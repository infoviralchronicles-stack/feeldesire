const fs = require('fs');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'admin.html'
    && !['lifestyle.html','technology.html','entertainment.html','health.html','travel.html','business.html','fashion.html','food.html','trending-news.html','our-story.html','contact.html','advertise.html','privacy-policy.html','about-us.html'].includes(f)
);

let updated = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace figcaption with h3 title style and move it ABOVE the image
    content = content.replace(/<figure style="[^"]*">\s*<img src="([^"]+)" style="([^"]*)" alt="([^"]*)">\s*<figcaption[^>]*>([^<]*)<\/figcaption>\s*<\/figure>/g, 
        (match, src, style, alt, caption) => {
            return `<figure class="article-figure">
<h3 class="image-title">${caption}</h3>
<img src="${src}" style="${style}" alt="${alt}">
</figure>`;
        });

    fs.writeFileSync(file, content);
    updated++;
});

// Update CSS
let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(/\/\* Image Captions \*\/[\s\S]*?line-height: 1\.5;\s*\}/g, '');

css += `
/* Image Titles */
.article-body .article-figure {
  margin: 35px 0;
}
.article-body .image-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-dark, #1a1a2e);
  margin-bottom: 12px;
  line-height: 1.3;
}
`;
fs.writeFileSync('style.css', css);

console.log(`Updated ${updated} articles - captions now show as titles above images`);
