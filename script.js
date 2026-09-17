document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.main-nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // --- Homepage / Grid Load More & Pagination ---
  const grid = document.getElementById('latest-articles-grid');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const loadMoreContainer = document.getElementById('load-more-container');
  const currentCountSpan = document.getElementById('current-count');
  const totalCountSpan = document.getElementById('total-count');

  if (grid && loadMoreBtn) {
    const articles = Array.from(grid.querySelectorAll('.post-card'));
    const PAGE_SIZE = 10;
    let visibleCount = PAGE_SIZE;

    const updateVisibility = () => {
      articles.forEach((article, index) => {
        if (index < visibleCount) {
          article.style.display = '';
        } else {
          article.style.display = 'none';
        }
      });

      const shown = Math.min(visibleCount, articles.length);
      if (currentCountSpan) currentCountSpan.textContent = shown;
      if (totalCountSpan) totalCountSpan.textContent = articles.length;

      if (visibleCount >= articles.length) {
        loadMoreBtn.classList.add('hidden');
      } else {
        loadMoreBtn.classList.remove('hidden');
      }
    };

    // Initial display setup: show first 10 articles
    if (articles.length > 0) {
      updateVisibility();
      if (articles.length <= PAGE_SIZE) {
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
      }
    } else {
      if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    }

    loadMoreBtn.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      updateVisibility();
    });
  }

  // ==========================================
  // --- Global Site Search & Live Suggestions
  // ==========================================
  let searchIndex = null;
  let searchIndexPromise = null;

  function fetchSearchIndex() {
    if (searchIndex) return Promise.resolve(searchIndex);
    if (searchIndexPromise) return searchIndexPromise;

    searchIndexPromise = fetch('search-index.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load search-index.json');
        return res.json();
      })
      .then(data => {
        searchIndex = data;
        return data;
      })
      .catch(err => {
        console.warn('[Search] Could not load search-index.json:', err);
        return [];
      });

    return searchIndexPromise;
  }

  // Preload search index in idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => fetchSearchIndex());
  } else {
    setTimeout(fetchSearchIndex, 1500);
  }

  const searchForms = document.querySelectorAll('.site-search-form');

  searchForms.forEach(form => {
    const input = form.querySelector('.site-search-input');
    const dropdown = form.parentElement.querySelector('.search-results-dropdown');
    if (!input) return;

    let debounceTimer = null;
    let selectedIndex = -1;

    const performSearch = (query) => {
      query = query.trim().toLowerCase();
      if (!query || query.length < 2) {
        if (dropdown) {
          dropdown.innerHTML = '';
          dropdown.classList.remove('active');
        }
        return;
      }

      fetchSearchIndex().then(data => {
        const queryTerms = query.split(/\s+/).filter(Boolean);
        const matches = data.filter(item => {
          const searchable = `${item.title} ${item.excerpt} ${item.category}`.toLowerCase();
          return queryTerms.every(term => searchable.includes(term));
        });

        if (!dropdown) return;

        if (matches.length === 0) {
          dropdown.innerHTML = `
            <div class="search-empty-state">
              No matching articles found for "<strong>${escapeHtml(query)}</strong>"
            </div>
          `;
          dropdown.classList.add('active');
          return;
        }

        const topMatches = matches.slice(0, 5);
        let itemsHtml = topMatches.map((item, idx) => `
          <li class="search-dropdown-item" data-index="${idx}">
            <a href="${item.url}">
              ${item.image ? `<img src="${item.image}" alt="${escapeHtml(item.title)}" class="search-dropdown-thumb">` : ''}
              <div class="search-dropdown-info">
                <span class="search-dropdown-category">${item.category}</span>
                <h5 class="search-dropdown-title">${highlightQuery(escapeHtml(item.title), query)}</h5>
              </div>
            </a>
          </li>
        `).join('');

        let footerHtml = `
          <a href="search.html?q=${encodeURIComponent(query)}" class="search-dropdown-view-all">
            View all ${matches.length} results &rarr;
          </a>
        `;

        dropdown.innerHTML = `
          <div class="search-dropdown-header">Articles (${matches.length})</div>
          <ul class="search-dropdown-list">${itemsHtml}</ul>
          ${footerHtml}
        `;
        dropdown.classList.add('active');
        selectedIndex = -1;
      });
    };

    input.addEventListener('focus', () => {
      fetchSearchIndex();
      if (input.value.trim().length >= 2) {
        performSearch(input.value);
      }
    });

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        performSearch(input.value);
      }, 150);
    });

    // Keyboard navigation (Arrow keys, Enter, Esc)
    input.addEventListener('keydown', (e) => {
      if (!dropdown || !dropdown.classList.contains('active')) return;
      const items = dropdown.querySelectorAll('.search-dropdown-item');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateSelection(items, selectedIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateSelection(items, selectedIndex);
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && items[selectedIndex]) {
          e.preventDefault();
          const link = items[selectedIndex].querySelector('a');
          if (link) window.location.href = link.href;
        }
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('active');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (q) {
        window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      }
    });
  });

  function updateSelection(items, index) {
    items.forEach((item, i) => {
      if (i === index) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-search-wrapper')) {
      document.querySelectorAll('.search-results-dropdown').forEach(d => d.classList.remove('active'));
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function highlightQuery(text, query) {
    if (!query) return text;
    const terms = query.split(/\s+/).filter(Boolean);
    let result = text;
    for (const term of terms) {
      const regex = new RegExp(`(${term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, '<mark style="background:#fef08a; padding:0 2px; border-radius:2px;">$1</mark>');
    }
    return result;
  }
});

