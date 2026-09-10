const fs = require('fs');
const file = 'the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html';
let content = fs.readFileSync(file, 'utf8');

// Shorten the first FAQ
content = content.replace(
    /<p><strong>Do smart home gadgets require high-speed internet to function\?<\/strong>.*?<\/p>/g,
    '<p><strong>Do smart home gadgets require high-speed internet to function?</strong> Yes, active internet connectivity is essential for remote access, voice commands, and automation.</p>'
);

// Shorten the second FAQ
content = content.replace(
    /<p><strong>Are smart home devices difficult to install without professional help\?<\/strong>.*?<\/p>/g,
    '<p><strong>Are smart home devices difficult to install without professional help?</strong> Most consumer gadgets are designed for easy DIY installation, though complex wiring might require an electrician.</p>'
);

// Shorten the third FAQ
content = content.replace(
    /<p><strong>How do smart home gadgets help reduce monthly utility bills\?<\/strong>.*?<\/p>/g,
    '<p><strong>How do smart home gadgets help reduce monthly utility bills?</strong> They automate lighting and climate control based on your schedule, eliminating wasted energy when you are not home.</p>'
);

// Shorten the fourth FAQ
content = content.replace(
    /<p><strong>What is the Matter protocol and why does it matter\?<\/strong>.*?<\/p>/g,
    '<p><strong>What is the Matter protocol and why does it matter?</strong> Matter is a universal connectivity standard that ensures different smart home brands can easily communicate with each other.</p>'
);

// Shorten the fifth FAQ
content = content.replace(
    /<p><strong>How can homeowners effectively secure their smart devices from cyber threats\?<\/strong>.*?<\/p>/g,
    '<p><strong>How can homeowners effectively secure their smart devices from cyber threats?</strong> Use strong passwords, enable two-factor authentication, and keep your device firmware regularly updated.</p>'
);

fs.writeFileSync(file, content);
console.log("FAQs shortened!");
