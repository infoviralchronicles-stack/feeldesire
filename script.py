import re
import os
import shutil

# Remove old dummy articles
for f in ['article.html', 'article-travel.html', 'article-fashion.html']:
    if os.path.exists(f):
        os.remove(f)

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Pattern to find all articles in index.html
# We want to replace all hrefs that point to these articles with title slugs
titles = re.findall(r'<h3 class="post-title">(.*?)</h3>', html)
trending_titles = re.findall(r'<a href="[^"]*" class="trending-title">(.*?)</a>', html)
all_titles = titles + trending_titles

def slugify(title):
    s = title.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_-]+', '-', s)
    s = re.sub(r'^-+|-+$', '', s)
    return s + ".html"

with open('index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Base template
template = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} - FeelDesire</title>
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
        
        <button class="mobile-menu-btn" aria-label="Toggle Navigation">?</button>
      </div>
    </div>
    
    <nav class="main-nav">
      <div class="container">
        <ul>
          <li><a href="#">Lifestyle</a></li>
          <li><a href="#">Entertainment</a></li>
          <li><a href="#">Technology</a></li>
          <li><a href="#">Health</a></li>
          <li><a href="#">Travel</a></li>
          <li><a href="#">Business</a></li>
          <li><a href="#">Fashion</a></li>
          <li><a href="#">Food</a></li>
          <li><a href="#">Trending News</a></li>
        </ul>
      </div>
    </nav>
  </header>

  <main class="container">
    
    <article>
      <header class="article-header">
        <a href="#" class="post-category">Category</a>
        <h1 class="article-title">{title}</h1>
        <div class="article-meta">
          By <a href="#"><strong>Editorial Team</strong></a> • September 9, 2026 • 5 min read
        </div>
      </header>

      <div class="article-featured-image">
        <img src="https://images.unsplash.com/photo-1512413914421-eb4232c2af36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Article Image">
      </div>

      <div class="article-body">
        <p>This is a generated placeholder article for <strong>{title}</strong>. In a real dynamic website, this content would be fetched from a database or CMS based on the URL slug.</p>
        
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        
        <blockquote>
          "Inspirational quote related to the article topic."
        </blockquote>

        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>
    </article>

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
            <li><a href="#">Lifestyle</a></li>
            <li><a href="#">Technology</a></li>
            <li><a href="#">Health</a></li>
            <li><a href="#">Travel</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer-title">About Us</h4>
          <ul class="footer-links">
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Advertise</a></li>
            <li><a href="#">Privacy Policy</a></li>
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
</html>'''

# Replace links in index.html block by block
for title in titles:
    slug = slugify(title)
    # Write the new HTML file
    with open(slug, 'w', encoding='utf-8') as f:
        f.write(template.replace('{title}', title))
    
    # We need to replace the href that surrounds this title and the image above it
    # We will do a generic replacement for article.html, article-travel.html, etc.
    # Actually, let's just use regex to replace the href directly before the title
    # First, let's just make it simple: we replace href=".*?" where it's part of the article card

for title in trending_titles:
    slug = slugify(title)
    with open(slug, 'w', encoding='utf-8') as f:
        f.write(template.replace('{title}', title))

# Update index.html
# It's easier to just do a manual replacement in Python for each block
import re
new_index = index_content

def repl(m):
    # m is the whole block of the article card
    block = m.group(0)
    # extract title
    title_match = re.search(r'<h3 class="post-title">(.*?)</h3>', block)
    if title_match:
        slug = slugify(title_match.group(1))
        # replace all hrefs in this block that point to article*.html
        block = re.sub(r'href="article[^"]*\.html"', f'href="{slug}"', block)
    return block

new_index = re.sub(r'(?s)<article class="post-card">.*?</article>', repl, new_index)

def repl_trending(m):
    block = m.group(0)
    title_match = re.search(r'class="trending-title">(.*?)</a>', block)
    if title_match:
        slug = slugify(title_match.group(1))
        block = re.sub(r'href="article[^"]*\.html"', f'href="{slug}"', block)
    return block

new_index = re.sub(r'(?s)<li>\s*<a href="#" class="post-category">.*?</li>', repl_trending, new_index)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_index)

print("Done")
