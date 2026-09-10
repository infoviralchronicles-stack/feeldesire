const fs = require('fs');
let content = fs.readFileSync('single-publish.js', 'utf8');

// replace first declaration of `const html = `<!DOCTYPE html>`
content = content.replace(/const html = \`<!DOCTYPE html>/g, 'const articleHtml = `<!DOCTYPE html>');
// replace fs.writeFileSync(\`${slug}.html\`, html);
content = content.replace(/fs\.writeFileSync\(`\$\{slug\}\.html`, html\);/g, 'fs.writeFileSync(`${slug}.html`, articleHtml);');

fs.writeFileSync('single-publish.js', content);
console.log("Fixed!");
