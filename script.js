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
});

