const fs = require('fs');
let admin = fs.readFileSync('admin.html', 'utf8');

// The broken code has: replace(/`json/g, '').replace(/`/g, '')
// We need it to be: replace(/```json/gi, '').replace(/```/g, '')

admin = admin.replace(/replace\(\/\`json\/g,\s*''\)\.replace\(\/\`\/g,\s*''\)/g, "replace(/```json/gi, '').replace(/```/g, '')");

fs.writeFileSync('admin.html', admin);
console.log("Fixed backticks in admin.html");
