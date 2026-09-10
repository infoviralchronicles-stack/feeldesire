const fs = require('fs');

const imgRule = "exact length.\\n10. Include EXACTLY 2 to 3 highly relevant images inside the article body. Use this exact HTML format: <img src='https://image.pollinations.ai/prompt/{detailed-image-description-related-to-the-section}?width=800&height=500&nologo=true' style='width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>`;";

let admin = fs.readFileSync('admin.html', 'utf8');
admin = admin.replace("exact length.`;", imgRule);
fs.writeFileSync('admin.html', admin);

let single = fs.readFileSync('single-publish.js', 'utf8');
single = single.replace("exact length.`;", imgRule);
fs.writeFileSync('single-publish.js', single);

console.log("Updated!");
