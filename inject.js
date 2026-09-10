const fs = require('fs');

const file = 'the-ultimate-guide-to-choosing-the-perfect-bathroom-sink-for-your-home.html';
let content = fs.readFileSync(file, 'utf8');

const img1 = `<img src="https://image.pollinations.ai/prompt/modern%20bathroom%20sink%20interior%20design?width=800&height=500&nologo=true" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="Modern bathroom sink design">`;

const img2 = `<img src="https://image.pollinations.ai/prompt/elegant%20bathroom%20sink%20with%20faucet%20close%20up?width=800&height=500&nologo=true" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="Elegant bathroom sink faucet">`;

let pCount = 0;
content = content.replace(/<\/p>/g, (match) => {
    pCount++;
    if (pCount === 2) return match + '\\n' + img1;
    if (pCount === 6) return match + '\\n' + img2;
    return match;
});

fs.writeFileSync(file, content);
console.log("Injected images!");
