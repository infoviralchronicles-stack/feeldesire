const https = require('https');
https.get('https://tech-new-auto.vercel.app/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        // Find CSS files
        const matches = data.match(/href="([^"]+\.css[^"]*)"/g);
        console.log("CSS files:", matches);
    });
});
