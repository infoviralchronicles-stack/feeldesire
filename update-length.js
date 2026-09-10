const fs = require('fs');

const lengthRule = "\\n9. MUST BE between 900 and 1050 words in length. Be highly detailed and elaborate on points to reach this word count, but DO NOT exceed 1050 words.";

// For admin.html
let admin = fs.readFileSync('admin.html', 'utf8');
if (!admin.includes("900 and 1050 words")) {
    admin = admin.replace(/anchor text\.\`;/, `anchor text.\\n9. The generated article length MUST be strictly between 900 and 1050 words. Elaborate deeply on each section to reach this exact length.\`;`);
    fs.writeFileSync('admin.html', admin);
    console.log("Updated admin.html");
}

// For single-publish.js
let single = fs.readFileSync('single-publish.js', 'utf8');
if (!single.includes("900 and 1050 words")) {
    single = single.replace(/anchor text\.\`;/, `anchor text.\\n9. The generated article length MUST be strictly between 900 and 1050 words. Elaborate deeply on each section to reach this exact length.\`;`);
    fs.writeFileSync('single-publish.js', single);
    console.log("Updated single-publish.js");
}
