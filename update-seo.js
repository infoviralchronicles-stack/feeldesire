const fs = require('fs');

const seoPrompt = `You are an expert SEO magazine writer. Write a highly comprehensive, engaging, and 100% SEO-optimized article about "\${keyword}".
Return ONLY a valid JSON object (no markdown formatting) with these keys:
{"title": "SEO friendly Catchy title that MUST contain the exact keyword \\"\${keyword}\\"", "category": "Technology", "excerpt": "1 sentence highly SEO optimized meta description", "htmlContent": "HTML body without html/body tags."}
IMPORTANT SEO RULES: 
1. Use the exact keyword '\${keyword}' in the first 50 words, bolded (<strong>). 
2. Use LSI and related keywords naturally throughout the text.
3. Structure the article with proper H2 and H3 tags containing variations of the keyword. 
4. Include bulleted lists for readability.
5. Provide high value, deeply informative content. 
6. Do NOT include the current year anywhere. 
7. Do NOT include an H1 tag (the title acts as H1). 
8. Include exactly 2 internal HTML links (<a> tags) pointing to other pages like 'technology.html' or 'lifestyle.html' with natural anchor text. First link in the first paragraph, second in a middle paragraph.`;

// Fix admin.html
let admin = fs.readFileSync('admin.html', 'utf8');
// The prompt string in admin.html starts with: const prompt = `You are an expert SEO magazine writer
// Let's replace the whole assignment
admin = admin.replace(/const prompt = \`You are an expert SEO magazine writer[\s\S]*?paragraph\. Use natural anchor text\.\`;/, `const prompt = \`${seoPrompt}\`;`);
fs.writeFileSync('admin.html', admin);

// Fix single-publish.js
let single = fs.readFileSync('single-publish.js', 'utf8');
single = single.replace(/const keyword = "[^"]+";/, 'const keyword = process.argv[2] || "smart phone";');
single = single.replace(/const prompt = \`You are an expert SEO magazine writer[\s\S]*?paragraph\. Use natural anchor text\.\`;/, `const prompt = \`${seoPrompt}\`;`);
fs.writeFileSync('single-publish.js', single);

console.log("Updated prompts for 100% SEO score!");
