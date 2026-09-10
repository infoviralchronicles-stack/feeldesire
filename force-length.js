const fs = require('fs');

const newPrompt = `const prompt = \`You are an expert SEO magazine writer. Write a massive, highly comprehensive, and 100% SEO-optimized article about "\${keyword}".
Return ONLY a valid JSON object (no markdown formatting) with these keys:
{"title": "Catchy title MUST contain the exact keyword \\"\${keyword}\\"", "category": "Technology", "excerpt": "1 sentence SEO meta description", "htmlContent": "HTML body without html/body tags."}
IMPORTANT CONTENT RULES (CRITICAL FOR WORD COUNT):
1. The article MUST be extremely long, spanning exactly between 950 and 1050 words.
2. You MUST write at least 8 distinct sections (H2).
3. Each section MUST contain at least 2 very detailed, long paragraphs. Do not write short sections.
4. Include a comprehensive "Pros and Cons" section and a detailed "Frequently Asked Questions (FAQ)" section with at least 5 questions and long answers.
5. Provide high value, deeply informative, and expansive content. Do not be concise. Expand on every single detail.
SEO RULES:
6. Use the exact keyword '\${keyword}' in the first 50 words, bolded (<strong>).
7. Do NOT include the current year anywhere.
8. Do NOT include an H1 tag.\`;`;

function updatePrompt(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    
    // Find the prompt definition
    // It starts with: const prompt = `You are an expert SEO
    // And ends with the backtick and semicolon: `;
    
    const promptRegex = /const prompt = `You are an expert SEO[\s\S]*?`;/;
    content = content.replace(promptRegex, newPrompt);
    
    fs.writeFileSync(filename, content);
}

updatePrompt('admin.html');
updatePrompt('single-publish.js');
console.log("Updated prompt to force length!");
