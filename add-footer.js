const fs = require('fs');

const footer = `
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
            <li><a href="our-story.html">Our Story</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="advertise.html">Advertise</a></li>
            <li><a href="privacy-policy.html">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; FeelDesire. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
  <script src="script.js"></script>`;

// 1. Fix the template in single-publish.js
let single = fs.readFileSync('single-publish.js', 'utf8');
single = single.replace(
    '  </main>\n</body>\n</html>`',
    `  </main>\n${footer}\n</body>\n</html>\``
);
// Try other possible formats
single = single.replace(
    '</main>\r\n</body>\r\n</html>`',
    `</main>\n${footer}\n</body>\n</html>\``
);
fs.writeFileSync('single-publish.js', single);

// 2. Fix admin.html template (createHTML function)
let admin = fs.readFileSync('admin.html', 'utf8');
// Find the createHTML function closing
admin = admin.replace(
    /(<\/article>\s*<\/main>\s*)<\/body>\s*<\/html>/g,
    `$1${footer}\n</body>\n</html>`
);
fs.writeFileSync('admin.html', admin);

// 3. Fix ALL existing article HTML files (add footer if missing)
const files = fs.readdirSync('.').filter(f => 
    f.endsWith('.html') && 
    f !== 'index.html' && 
    f !== 'admin.html' &&
    !f.includes('category')
);

let fixed = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('<footer>')) {
        // Add footer before </body>
        content = content.replace('</body>', `${footer}\n</body>`);
        fs.writeFileSync(file, content);
        fixed++;
    }
});

console.log(`Fixed template in single-publish.js and admin.html`);
console.log(`Added footer to ${fixed} existing article pages`);
