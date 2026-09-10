const fs = require('fs');
const path = require('path');

const authors = ["Emma Collins", "David Thorne", "Alex Mercer"];

function getRandomAuthor() {
    return authors[Math.floor(Math.random() * authors.length)];
}

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace <div class="post-meta">DATE</div>
    // or <span class="post-meta">DATE</span>
    // Note: ensure we don't replace if it already has "By "
    
    content = content.replace(/(<(div|span) class="post-meta">)(?!By )([^<]+)(<\/(div|span)>)/g, (match, p1, p2, p3, p4) => {
        const author = getRandomAuthor();
        return `${p1}By <span class="author-name" style="font-weight:600; color:var(--text-dark);">${author}</span> &bull; ${p3}${p4}`;
    });
    
    // For admin.html specifically, which might have "By AI Editor"
    content = content.replace(/By AI Editor/g, `By <span class="author-name" style="font-weight:600; color:var(--text-dark);">\${["Emma Collins", "David Thorne", "Alex Mercer"][Math.floor(Math.random()*3)]}</span>`);

    fs.writeFileSync(file, content);
});

// Update single-publish.js as well
let jsContent = fs.readFileSync('single-publish.js', 'utf8');
// Look for <div class="post-meta">${dateStr}</div>
jsContent = jsContent.replace(/<div class="post-meta">\$\{dateStr\}<\/div>/g, 
    `<div class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">\${["Emma Collins", "David Thorne", "Alex Mercer"][Math.floor(Math.random()*3)]}</span> &bull; \${dateStr}</div>`);
jsContent = jsContent.replace(/<span class="post-meta">\$\{dateStr\}<\/span>/g, 
    `<span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">\${["Emma Collins", "David Thorne", "Alex Mercer"][Math.floor(Math.random()*3)]}</span> &bull; \${dateStr}</span>`);

fs.writeFileSync('single-publish.js', jsContent);

// Update admin.html script section if there's any raw dateStr left
let adminContent = fs.readFileSync('admin.html', 'utf8');
adminContent = adminContent.replace(/<span class="post-meta">\$\{dateStr\}<\/span>/g, 
    `<span class="post-meta">By <span class="author-name" style="font-weight:600; color:var(--text-dark);">\${["Emma Collins", "David Thorne", "Alex Mercer"][Math.floor(Math.random()*3)]}</span> &bull; \${dateStr}</span>`);
fs.writeFileSync('admin.html', adminContent);

console.log("Authors added to all files.");
