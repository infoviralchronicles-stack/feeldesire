const fs = require('fs');

// --- 1. Update the Smart Home Gadgets article with direct, highly relevant internal links ---
let smartHome = fs.readFileSync('the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html', 'utf8');

smartHome = smartHome.replace(
  /<a href="the-ultimate-guide-to-buy-iphone-how-to-choose-the-right-model-for-your-needs\.html"[^>]*>The Ultimate Guide to Buy iPhone: How to Choose the Right Model for Your Needs<\/a>/,
  '<a href="how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">How to Choose the Ultimate Smart Phone for Your Modern Lifestyle</a>'
);
smartHome = smartHome.replace(
  'You might also enjoy reading',
  'To control your connected hub on the go, see our guide on'
);

smartHome = smartHome.replace(
  /<a href="the-ultimate-shopping-guide-how-to-buy-bed-designs-for-dreamy-sleep\.html"[^>]*>The Ultimate Shopping Guide: How to Buy Bed Designs for Dreamy Sleep<\/a>/,
  '<a href="beyond-the-chatbot-the-breakthrough-ai-innovations-defining-2026.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">Breakthrough AI Innovations Powering Modern Automation</a>'
);
smartHome = smartHome.replace(
  'Discover more in',
  'Learn how intelligent machine learning shapes these devices in'
);

fs.writeFileSync('the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html', smartHome);
console.log('Updated smart home gadgets internal links');

// --- 2. Update Bathroom Sink with relevant links (e.g. Bathroom Shower) ---
let sink = fs.readFileSync('the-ultimate-guide-to-choosing-the-perfect-bathroom-sink-for-your-home.html', 'utf8');

sink = sink.replace(
  /<a href="binge-worthy-beats-the-top-netflix-shows-you-need-to-stream-right-now\.html"[^>]*>Binge-Worthy Beats: The Top Netflix Shows You Need to Stream Right Now<\/a>/,
  '<a href="transform-your-daily-routine-the-ultimate-guide-to-upgrading-your-bathroom-shower.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">Upgrading Your Bathroom Shower for a Spa-Like Experience</a>'
);
sink = sink.replace(
  'You might also enjoy reading',
  'For a complete washroom redesign, pair this with'
);

sink = sink.replace(
  /<a href="the-ultimate-shopping-guide-how-to-buy-bed-designs-for-dreamy-sleep\.html"[^>]*>The Ultimate Shopping Guide: How to Buy Bed Designs for Dreamy Sleep<\/a>/,
  '<a href="the-art-of-less-how-minimalist-living-can-unlock-your-best-life.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">Minimalist Living and Clean Interior Design</a>'
);
sink = sink.replace(
  'Discover more in',
  'Explore clean aesthetic concepts in our guide to'
);

fs.writeFileSync('the-ultimate-guide-to-choosing-the-perfect-bathroom-sink-for-your-home.html', sink);
console.log('Updated bathroom sink internal links');

// --- 3. Update Smartphone article with relevant links (e.g. Smart Home Gadgets, Laptop, iPhone) ---
let phone = fs.readFileSync('how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html', 'utf8');

phone = phone.replace(
  /<a href="marvel-s--blockbuster-slate-doctor-doom-spider-man-and-the-multiverse-s-highest-stakes\.html"[^>]*>Marvel's Blockbuster Slate: Doctor Doom, Spider-Man, and the Multiverse's Highest Stakes<\/a>/,
  '<a href="the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">The Ultimate Guide to Smart Home Gadgets</a>'
);
phone = phone.replace(
  'You might also enjoy reading',
  'Connect your handset to household automation with'
);

phone = phone.replace(
  /<a href="the-ultimate-shopping-guide-how-to-buy-bed-designs-for-dreamy-sleep\.html"[^>]*>The Ultimate Shopping Guide: How to Buy Bed Designs for Dreamy Sleep<\/a>/,
  '<a href="the-ultimate-guide-to-buy-iphone-how-to-choose-the-right-model-for-your-needs.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">The Ultimate Guide to Buy iPhone</a>'
);
phone = phone.replace(
  'Discover more in',
  'If you specifically prefer Apple ecosystems, read'
);

fs.writeFileSync('how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html', phone);
console.log('Updated smartphone internal links');
