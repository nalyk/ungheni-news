/**
 * Search Module - Lazy loaded when search is actually needed
 * Performance-optimized search functionality with Pagefind
 */

class SearchManager {
  constructor() {
    this.initialized = false;
    this.pagefind = null;
    this.searchInput = null;
    this.searchResults = null;
    this.debounceTimer = null;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Dynamically import Pagefind when needed
      this.pagefind = await import('/pagefind/pagefind.js');
      await this.pagefind.options({
        ranking: {
          pageLength: 1,
          termFrequency: 2,
          termSaturation: 8
        }
      });
      
      this.setupEventListeners();
      this.initialized = true;
      console.log('Search initialized successfully');
    } catch (error) {
      console.error('Failed to initialize search:', error);
    }
  }

  setupEventListeners() {
    this.searchInput = document.querySelector('#search-input');
    this.searchResults = document.querySelector('#search-results');
    
    if (!this.searchInput || !this.searchResults) {
      console.warn('Search elements not found');
      return;
    }

    // Debounced search with modern async/await
    this.searchInput.addEventListener('input', (event) => {
      clearTimeout(this.debounceTimer);
      const query = event.target.value.trim();
      
      if (query.length < 2) {
        this.clearResults();
        return;
      }

      this.debounceTimer = setTimeout(() => this.performSearch(query), 300);
    });

    // Handle keyboard navigation
    this.searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.clearResults();
        event.target.blur();
      }
    });
  }

  async performSearch(query) {
    if (!this.pagefind) return;
    
    try {
      this.showLoading();
      const search = await this.pagefind.search(query);
      const results = await Promise.all(search.results.map(r => r.data()));
      this.displayResults(results, query);
    } catch (error) {
      console.error('Search error:', error);
      this.showError();
    }
  }

  displayResults(results, query) {
    if (!this.searchResults) return;

    if (results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="search-no-results">
          <p>Nu am găsit rezultate pentru "<strong>${this.escapeHtml(query)}</strong>"</p>
          <p class="text-muted">Încearcă cu alți termeni de căutare.</p>
        </div>
      `;
      return;
    }

    const resultsHtml = results.slice(0, 10).map(result => `
      <article class="search-result">
        <h3><a href="${result.url}" class="search-result-title">${result.meta.title}</a></h3>
        <p class="search-result-excerpt">${this.highlightQuery(result.excerpt, query)}</p>
        <div class="search-result-meta">
          <time>${new Date(result.meta.date).toLocaleDateString('ro-RO')}</time>
          ${result.meta.category ? `<span class="search-result-category">${result.meta.category}</span>` : ''}
        </div>
      </article>
    `).join('');

    this.searchResults.innerHTML = `
      <div class="search-results-header">
        <p>Am găsit ${results.length} rezultat${results.length !== 1 ? 'e' : ''} pentru "<strong>${this.escapeHtml(query)}</strong>"</p>
      </div>
      ${resultsHtml}
    `;
  }

  showLoading() {
    if (this.searchResults) {
      this.searchResults.innerHTML = '<div class="search-loading">Se caută...</div>';
    }
  }

  showError() {
    if (this.searchResults) {
      this.searchResults.innerHTML = '<div class="search-error">A apărut o eroare. Încearcă din nou.</div>';
    }
  }

  clearResults() {
    if (this.searchResults) {
      this.searchResults.innerHTML = '';
    }
  }

  highlightQuery(text, query) {
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SearchManager = SearchManager;
}

export default SearchManager;