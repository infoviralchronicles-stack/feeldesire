const fs = require('fs');

const categories = [
  'Lifestyle', 'Entertainment', 'Technology', 'Health', 'Travel', 'Business', 'Fashion', 'Food', 'Trending News'
];

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{category} - FeelDesire</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <div class="container">
      <div class="header-top">
        <a href="index.html" class="logo">Feel<span>Desire</span></a>
        <div class="search-bar">
          <input type="text" placeholder="Search articles...">
          <button type="submit">Search</button>
        </div>
        <button class="mobile-menu-btn" aria-label="Toggle Navigation">&#9776;</button>
      </div>
    </div>
    <nav class="main-nav">
      <div class="container">
        <ul>
          <li><a href="lifestyle.html">Lifestyle</a></li>
          <li><a href="entertainment.html">Entertainment</a></li>
          <li><a href="technology.html">Technology</a></li>
          <li><a href="health.html">Health</a></li>
          <li><a href="travel.html">Travel</a></li>
          <li><a href="business.html">Business</a></li>
          <li><a href="fashion.html">Fashion</a></li>
          <li><a href="food.html">Food</a></li>
          <li><a href="trending-news.html">Trending News</a></li>
        </ul>
      </div>
    </nav>
  </header>

  <main class="container" style="padding: 60px 0;">
    <h1 style="font-family: 'Playfair Display', serif; font-size: 2.5rem; margin-bottom: 30px; border-bottom: 2px solid #c0392b; padding-bottom: 10px; display: inline-block;">Category: {category}</h1>
    
    <div class="post-grid">
      <!-- Dummy Article 1 -->
      <article class="post-card">
        <a href="#" class="post-img-wrapper" style="background:#eaeaea; display:block; height:200px;">
        </a>
        <div class="post-content" style="padding-top:15px;">
          <a href="#" class="post-category">{category}</a>
          <a href="#">
            <h3 class="post-title">Latest Updates in {category}</h3>
          </a>
          <div class="post-meta">By Editorial Team • Just Now</div>
          <p class="post-excerpt">Discover the most recent trends, news, and insights covering everything you need to know about {category}...</p>
        </div>
      </article>

      <!-- Dummy Article 2 -->
      <article class="post-card">
        <a href="#" class="post-img-wrapper" style="background:#eaeaea; display:block; height:200px;">
        </a>
        <div class="post-content" style="padding-top:15px;">
          <a href="#" class="post-category">{category}</a>
          <a href="#">
            <h3 class="post-title">Why {category} is Changing Faster Than Ever</h3>
          </a>
          <div class="post-meta">By Editorial Team • 2 Days Ago</div>
          <p class="post-excerpt">An in-depth analysis of how this sector is evolving and what it means for our daily lives...</p>
        </div>
      </article>
      
      <!-- Dummy Article 3 -->
      <article class="post-card">
        <a href="#" class="post-img-wrapper" style="background:#eaeaea; display:block; height:200px;">
        </a>
        <div class="post-content" style="padding-top:15px;">
          <a href="#" class="post-category">{category}</a>
          <a href="#">
            <h3 class="post-title">Top 5 Myths About {category} Debunked</h3>
          </a>
          <div class="post-meta">By Editorial Team • 1 Week Ago</div>
          <p class="post-excerpt">We take a closer look at the common misconceptions surrounding this topic and reveal the truth...</p>
        </div>
      </article>
    </div>
  </main>

  <footer>
    <div class="container">
      <div class="footer-content">
        <div>
          <a href="index.html" class="logo footer-logo">Feel<span>Desire</span></a>
          <p class="footer-desc">Your daily source for lifestyle, entertainment, tech, and health news. Stay inspired, stay informed.</p>
        </div>
        <div>
          <h4 class="footer-title">Categories</h4>
          <ul class="footer-links">
            <li><a href="lifestyle.html">Lifestyle</a></li>
            <li><a href="technology.html">Technology</a></li>
            <li><a href="health.html">Health</a></li>
            <li><a href="travel.html">Travel</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title">About Us</h4>
          <ul class="footer-links">
            <li><a href="about-us.html">About Us</a></li>
            <li><a href="our-story.html">Our Story</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="advertise.html">Advertise</a></li>
            <li><a href="privacy-policy.html">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 FeelDesire. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
  <script src="script.js"></script>
</body>
</html>`;

// Create category pages
categories.forEach(cat => {
  const slug = slugify(cat) + '.html';
  const html = template.replace(/\{category\}/g, cat);
  fs.writeFileSync(slug, html);
});

// Update navigation in ALL html files
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace main nav links
  content = content.replace(/<li><a href="#">Lifestyle<\/a><\/li>/g, '<li><a href="lifestyle.html">Lifestyle</a></li>');
  content = content.replace(/<li><a href="#">Entertainment<\/a><\/li>/g, '<li><a href="entertainment.html">Entertainment</a></li>');
  content = content.replace(/<li><a href="#">Technology<\/a><\/li>/g, '<li><a href="technology.html">Technology</a></li>');
  content = content.replace(/<li><a href="#">Health<\/a><\/li>/g, '<li><a href="health.html">Health</a></li>');
  content = content.replace(/<li><a href="#">Travel<\/a><\/li>/g, '<li><a href="travel.html">Travel</a></li>');
  content = content.replace(/<li><a href="#">Business<\/a><\/li>/g, '<li><a href="business.html">Business</a></li>');
  content = content.replace(/<li><a href="#">Fashion<\/a><\/li>/g, '<li><a href="fashion.html">Fashion</a></li>');
  content = content.replace(/<li><a href="#">Food<\/a><\/li>/g, '<li><a href="food.html">Food</a></li>');
  content = content.replace(/<li><a href="#">Trending News<\/a><\/li>/g, '<li><a href="trending-news.html">Trending News</a></li>');

  // Replace footer category links
  content = content.replace(/<li><a href="#">Lifestyle<\/a><\/li>/g, '<li><a href="lifestyle.html">Lifestyle</a></li>');
  content = content.replace(/<li><a href="#">Technology<\/a><\/li>/g, '<li><a href="technology.html">Technology</a></li>');
  content = content.replace(/<li><a href="#">Health<\/a><\/li>/g, '<li><a href="health.html">Health</a></li>');
  content = content.replace(/<li><a href="#">Travel<\/a><\/li>/g, '<li><a href="travel.html">Travel</a></li>');

  fs.writeFileSync(f, content);
});

console.log("Category pages generated and navigation links updated across all HTML files.");
