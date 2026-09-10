const fs = require('fs');

const css = `

/* Related & Latest Articles - Compact 2 Column Layout */
.related-articles .posts-grid,
.latest-articles .posts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.related-articles .post-card,
.latest-articles .post-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.related-articles .post-card:hover,
.latest-articles .post-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.related-articles .post-img-wrapper,
.latest-articles .post-img-wrapper {
  width: 120px;
  min-width: 120px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
}

.related-articles .post-img-wrapper img,
.latest-articles .post-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-articles .post-content,
.latest-articles .post-content {
  flex: 1;
  padding: 0;
}

.related-articles .post-title,
.latest-articles .post-title {
  font-size: 14px;
  line-height: 1.4;
  margin: 4px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-articles .post-category,
.latest-articles .post-category {
  font-size: 11px;
  padding: 2px 8px;
}

.related-articles .post-meta,
.latest-articles .post-meta {
  font-size: 11px;
}

.related-articles .post-excerpt,
.latest-articles .post-excerpt {
  display: none;
}

@media (max-width: 768px) {
  .related-articles .posts-grid,
  .latest-articles .posts-grid {
    grid-template-columns: 1fr;
  }
}
`;

let style = fs.readFileSync('style.css', 'utf8');
style += css;
fs.writeFileSync('style.css', style);
console.log("Added compact 2-column CSS for Related & Latest sections");
