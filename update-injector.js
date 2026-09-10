const fs = require('fs');

const injectionLogic = `
    let pCount = 0;
    html = html.replace(/<\\/p>/g, (match) => {
        pCount++;
        let append = '';
        if (pCount === 1) append = ' For more insights, check out our <a href="lifestyle.html">Lifestyle</a> section.';
        if (pCount === 3) append = ' Also, explore our <a href="technology.html">Technology</a> updates for modern trends.';
        
        let imgAppend = '';
        if (pCount === 2) imgAppend = \`\\n<img src="https://image.pollinations.ai/prompt/\${encodeURIComponent(keyword + " interior design")}?width=800&height=500&nologo=true" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="\${keyword} design">\`;
        if (pCount === 5) imgAppend = \`\\n<img src="https://image.pollinations.ai/prompt/\${encodeURIComponent(keyword + " close up high quality")}?width=800&height=500&nologo=true" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="\${keyword} details">\`;
        
        return append + match + imgAppend;
    });
`;

let admin = fs.readFileSync('admin.html', 'utf8');
admin = admin.replace(/let pCount = 0;[\s\S]*?return match;\s*\}\);/g, injectionLogic.trim());
fs.writeFileSync('admin.html', admin);

let single = fs.readFileSync('single-publish.js', 'utf8');
single = single.replace(/let pCount = 0;[\s\S]*?return match;\s*\}\);/g, injectionLogic.trim());
fs.writeFileSync('single-publish.js', single);
