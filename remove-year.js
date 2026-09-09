const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Remove "2026" from text content (careful not to break URLs, though 2026 is unlikely in URLs)
  // Let's replace " 2026" with "" or just "2026" with "" in titles and body
  if (content.includes('2026')) {
      content = content.replace(/\b2026\b/g, '');
      // Fix double spaces that might result
      content = content.replace(/  +/g, ' ');
      fs.writeFileSync(file, content);
      console.log('Fixed year in', file);
  }
}
console.log('Done removing 2026 from existing articles.');
