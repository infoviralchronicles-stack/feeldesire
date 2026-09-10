const fs = require('fs');

let admin = fs.readFileSync('admin.html', 'utf8');

const oldFetch = `   const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
   if (!response.ok) throw new Error("AI Generation failed.");
   
   const aiData = await response.json();
    let text = aiData.candidates[0].content.parts[0].text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const data = JSON.parse(text);`;

const newFetch = `   let response;
   let retries = 3;
   while (retries > 0) {
       response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
       if (response.ok) break;
       showLog("AI API busy, retrying in 5 seconds...");
       await new Promise(r => setTimeout(r, 5000));
       retries--;
   }
   if (!response || !response.ok) throw new Error("AI Generation failed after retries.");
   
   const aiData = await response.json();
   if (!aiData.candidates || !aiData.candidates[0]) {
       console.error(aiData);
       throw new Error("Invalid response from Gemini API.");
   }
   let text = aiData.candidates[0].content.parts[0].text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
   
   // Sometimes AI returns invalid JSON with trailing commas or unescaped quotes.
   let data;
   try {
       data = JSON.parse(text);
   } catch(e) {
       console.error("Failed to parse JSON", text);
       throw new Error("AI returned invalid JSON. Try again.");
   }`;

if (admin.includes(oldFetch)) {
    admin = admin.replace(oldFetch, newFetch);
    fs.writeFileSync('admin.html', admin);
    console.log("Updated admin.html fetch logic with retries.");
} else {
    console.log("Could not find the fetch block. Maybe it's formatted differently.");
}
