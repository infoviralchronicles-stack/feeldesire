const fs = require('fs');

const seoImageCSS = `

/* =========================================
   SEO STANDARD IMAGE SIZES
   ========================================= */

/* Featured image on article pages - 16:9 ratio (1200x675 standard) */
.article-featured-image {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 30px;
}
.article-featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  max-height: none;
}

/* Homepage & category card images - 16:9 ratio */
.post-img-wrapper {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}
.post-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 16/9;
}

/* Hero first card image */
.hero-grid .post-card:first-child .post-img-wrapper {
  aspect-ratio: 16/9;
  height: auto;
}

/* List layout card images */
.list-layout .post-img-wrapper {
  aspect-ratio: 16/9;
  height: auto;
}

/* Inline article body images - 16:9 ratio */
.article-body img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 12px;
  margin: 25px 0;
}

/* Related & Latest compact cards - keep small thumbnail */
.related-articles .post-img-wrapper,
.latest-articles .post-img-wrapper {
  width: 120px;
  min-width: 120px;
  height: 85px;
  aspect-ratio: auto;
  border-radius: 8px;
}
.related-articles .post-img-wrapper img,
.latest-articles .post-img-wrapper img {
  aspect-ratio: auto;
}
`;

let style = fs.readFileSync('style.css', 'utf8');
if (!style.includes('SEO STANDARD IMAGE SIZES')) {
    style += seoImageCSS;
    fs.writeFileSync('style.css', style);
    console.log("Added SEO standard image sizing CSS");
}
