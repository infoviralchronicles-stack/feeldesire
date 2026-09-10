const fs = require('fs');
const path = require('path');

const authors = ["Emma Collins", "David Thorne", "Alex Mercer"];

function getRandomAuthor() {
    return authors[Math.floor(Math.random() * authors.length)];
}

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the literal string `${["Emma Collins", "David Thorne", "Alex Mercer"][Math.floor(Math.random()*3)]}`
    // With an actual author name
    
    content = content.replace(/\$\{\["Emma Collins", "David Thorne", "Alex Mercer"\]\[Math\.floor\(Math\.random\(\)\*3\)\]\}/g, () => getRandomAuthor());
    
    fs.writeFileSync(file, content);
});

console.log("Fixed broken template literals in HTML files.");
