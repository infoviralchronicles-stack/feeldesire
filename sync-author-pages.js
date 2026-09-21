const fs = require('fs');

function syncAuthorPages() {
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const cardRegex = /<article class="post-card">([\s\S]*?)<\/article>/g;

  const authorMap = {
    'Alex Mercer': { file: 'author-alex-mercer.html', cards: [] },
    'David Thorne': { file: 'author-david-thorne.html', cards: [] },
    'Emma Collins': { file: 'author-emma-collins.html', cards: [] }
  };

  let m;
  while ((m = cardRegex.exec(indexHtml)) !== null) {
    const cardHtml = `<article class="post-card">${m[1]}</article>`;
    for (const author of Object.keys(authorMap)) {
      if (m[1].includes(`>${author}</a>`) || m[1].includes(`>${author}</span>`)) {
        const cleanCard = cardHtml.replace(/href=["'](author-[^"']+)\.html["']/g, 'href="$1"');
        authorMap[author].cards.push(cleanCard);
        break;
      }
    }
  }

  for (const [author, data] of Object.entries(authorMap)) {
    if (!fs.existsSync(data.file)) continue;
    let authorHtml = fs.readFileSync(data.file, 'utf8');
    const gridRegex = /(<div class="post-grid"[^>]*>)[\s\S]*?(<\/div>\s*<\/section>)/;
    if (gridRegex.test(authorHtml)) {
      authorHtml = authorHtml.replace(gridRegex, `$1\n${data.cards.join('\n')}\n$2`);
      fs.writeFileSync(data.file, authorHtml, 'utf8');
      console.log(`Updated ${data.file} with ${data.cards.length} articles.`);
    }
  }
}

syncAuthorPages();
module.exports = { syncAuthorPages };
