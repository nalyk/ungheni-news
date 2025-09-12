document.addEventListener('DOMContentLoaded', () => {
  const filterContainer = document.querySelector('.news-filters');
  if (!filterContainer) return;

  const filterButtons = filterContainer.querySelectorAll('.filter-btn');
  const newsGrid = document.querySelector('.news-grid');
  const newsCards = newsGrid ? newsGrid.querySelectorAll('.news-card') : [];

  if (!newsGrid || newsCards.length === 0) return;

  filterContainer.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.matches('.filter-btn')) return;

    // Update active button state
    filterButtons.forEach(btn => btn.classList.remove('is-active'));
    target.classList.add('is-active');

    const filter = target.dataset.filter;

    // Filter cards
    newsCards.forEach(card => {
      const cardFormat = card.dataset.format;
      const shouldShow = filter === 'all' || cardFormat === filter;
      
      card.style.display = shouldShow ? 'flex' : 'none';
    });
  });
});
