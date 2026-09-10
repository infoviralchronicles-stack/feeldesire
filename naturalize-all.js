const fs = require('fs');

// 1. Fix Smart Home Gadgets: remove em-dashes around the link
let smartHome = fs.readFileSync('the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html', 'utf8');
smartHome = smartHome.replace(
  'Intelligent lighting setups and voice-activated assistants—often managed directly from a <a href="how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">flagship smart phone</a> or dedicated automation hub—have fundamentally transformed',
  'Intelligent lighting setups and voice-activated assistants, often managed directly from a <a href="how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">flagship smart phone</a> or dedicated automation hub, have fundamentally transformed'
);
fs.writeFileSync('the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html', smartHome);
console.log('Fixed smart home gadgets em-dash');

// 2. Fix Bed Furniture: make links natural without forced phrases
let bed1 = fs.readFileSync('the-complete-guide-to-buy-bed-furniture-that-guarantees-restful-sleep.html', 'utf8');
bed1 = bed1.replace(
  'You might also enjoy reading <a href="the-ultimate-laptop-buyer-s-guide-how-to-find-your-perfect-match.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">The Ultimate Laptop Buyer\'s Guide: How to Find Your Perfect Match</a>.',
  'Just as finding the right work device matters for daytime efficiency, investing in your sleep setup directly powers your energy.'
);
bed1 = bed1.replace(
  'Discover more in <a href="the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">The Ultimate Guide to Smart Home Gadgets: Elevating Modern Living</a>.',
  'Many modern homeowners now pair sleep hygiene routines with automated ambient temperature controls and <a href="the-ultimate-guide-to-smart-home-gadgets-elevating-modern-living.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">smart home gadgets</a> to optimize recovery overnight.'
);
fs.writeFileSync('the-complete-guide-to-buy-bed-furniture-that-guarantees-restful-sleep.html', bed1);
console.log('Fixed bed furniture links');

// 3. Fix Bed Designs: make links natural without forced phrases
let bed2 = fs.readFileSync('the-ultimate-shopping-guide-how-to-buy-bed-designs-for-dreamy-sleep.html', 'utf8');
bed2 = bed2.replace(
  'You might also enjoy reading <a href="how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">How to Choose the Ultimate Smart Phone for Your Modern Lifestyle</a>.',
  'Coupled with evening digital wind-down routines managed from your <a href="how-to-choose-the-ultimate-smart-phone-for-your-modern-lifestyle.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">smart phone</a>, the right bed transforms sleep quality dramatically.'
);
bed2 = bed2.replace(
  'Discover more in <a href="marvel-s--blockbuster-slate-doctor-doom-spider-man-and-the-multiverse-s-highest-stakes.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">Marvel\'s Blockbuster Slate: Doctor Doom, Spider-Man, and the Multiverse\'s Highest Stakes</a>.',
  ''
);
fs.writeFileSync('the-ultimate-shopping-guide-how-to-buy-bed-designs-for-dreamy-sleep.html', bed2);
console.log('Fixed bed designs links');

// 4. Fix iPhone guide: make links natural without forced phrases
let iphone = fs.readFileSync('the-ultimate-guide-to-buy-iphone-how-to-choose-the-right-model-for-your-needs.html', 'utf8');
iphone = iphone.replace(
  '(Also, check out our <a href="binge-worthy-beats-the-top-netflix-shows-you-need-to-stream-right-now.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">Binge-Worthy Beats: The Top Netflix Shows You Need to Stream Right Now</a> for more advice.)',
  ''
);
iphone = iphone.replace(
  'If you are also in the market for a high-end portable computer for your creative workflows, be sure to read <a href="the-ultimate-laptop-buyer-s-guide-how-to-find-your-perfect-match.html">The Ultimate Laptop Buyer\'s Guide</a>.',
  'Creative professionals frequently sync their handheld workflows with dedicated workstations highlighted in our <a href="the-ultimate-laptop-buyer-s-guide-how-to-find-your-perfect-match.html" style="color: var(--primary-color); font-weight: 600; text-decoration: underline;">laptop buyer\'s guide</a>.'
);
fs.writeFileSync('the-ultimate-guide-to-buy-iphone-how-to-choose-the-right-model-for-your-needs.html', iphone);
console.log('Fixed iphone guide links');
