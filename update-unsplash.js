const fs = require('fs');

const unsplashKey = "hFl_35GKYSCzGjcC_nZrnchqvcvTJ17FTlCHL6IK6sg";

let admin = fs.readFileSync('admin.html', 'utf8');

// Replace the pollinations AI image url with unsplash API call in admin.html
// In admin.html, startPublishing():
// Currently it does:
// const imageUrl = \`https://image.pollinations.ai/prompt/\${encodeURIComponent(keyword + " photorealistic high quality")}?width=1200&height=800&nologo=true\`;
// and then the injection logic uses pollinations too.

// We will replace the whole image fetching logic.
// Let's find the injection logic and the imageUrl definition.
