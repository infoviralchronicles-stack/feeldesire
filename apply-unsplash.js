const fs = require('fs');

const unsplashKey = "hFl_35GKYSCzGjcC_nZrnchqvcvTJ17FTlCHL6IK6sg";

const fetchCode = `
    const unsplashKey = "${unsplashKey}";
    const unsplashUrl = 'https://api.unsplash.com/photos/random?count=3&query=' + encodeURIComponent(keyword) + '&client_id=' + unsplashKey;
    let images = [];
    try {
        const uRes = await fetch(unsplashUrl);
        if(uRes.ok) {
            images = await uRes.json();
        }
    } catch(e) { console.error(e); }
    
    const imageUrl = images[0] ? images[0].urls.regular : "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop";
    const inlineImg1 = images[1] ? images[1].urls.regular : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=500&fit=crop";
    const inlineImg2 = images[2] ? images[2].urls.regular : "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop";
`;

const injectionLogic = `
    let html = data.htmlContent;
    let pCount = 0;
    html = html.replace(/<\\/p>/g, (match) => {
        pCount++;
        let append = '';
        if (pCount === 1) append = ' For more insights, check out our <a href="lifestyle.html">Lifestyle</a> section.';
        if (pCount === 3) append = ' Also, explore our <a href="technology.html">Technology</a> updates for modern trends.';
        
        let imgAppend = '';
        if (pCount === 2) imgAppend = '\\n<img src="' + inlineImg1 + '" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="' + keyword + '">';
        if (pCount === 5) imgAppend = '\\n<img src="' + inlineImg2 + '" style="width:100%; border-radius:12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" alt="' + keyword + '">';
        
        return append + match + imgAppend;
    });
    data.htmlContent = html;
`;

function updateFile(filename) {
    let content = fs.readFileSync(filename, 'utf8');

    // Remove the old injection logic completely
    // We can do this by splitting and splicing
    // Find "let html = data.htmlContent;"
    // Find "const slug ="
    
    let parts = content.split("let html = data.htmlContent;");
    if (parts.length > 1) {
        let afterSlug = parts[1].split("const slug =");
        content = parts[0] + fetchCode + injectionLogic + "\\nconst slug =" + afterSlug.slice(1).join("const slug =");
    }
    
    // Remove the pollinations image URL completely
    content = content.replace(/const imageUrl = \`https:\/\/image\.pollinations\.ai.*?;/g, '');

    // Remove the AI prompt rule for images
    content = content.replace(/\\n10\. Include EXACTLY 2 to 3 highly relevant images.*?>/g, '');

    fs.writeFileSync(filename, content);
}

updateFile('admin.html');
updateFile('single-publish.js');

// Fix bathroom sink
let sinkHtml = fs.readFileSync('the-ultimate-guide-to-choosing-the-perfect-bathroom-sink-for-your-home.html', 'utf8');
sinkHtml = sinkHtml.replace(/https:\/\/image\.pollinations\.ai\/prompt\/[^"']+/g, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=800&fit=crop");
fs.writeFileSync('the-ultimate-guide-to-choosing-the-perfect-bathroom-sink-for-your-home.html', sinkHtml);

console.log("Updated Unsplash API!");
