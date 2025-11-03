/**
 * Editorial Dashboard Analytics
 * Triunghi.md - Real-time editorial compliance monitoring
 */

(function() {
  'use strict';

  // Load articles data from embedded JSON
  const articlesData = JSON.parse(document.getElementById('articles-data').textContent);

  // State
  let currentTimeRange = 30; // days
  let filteredArticles = [];

  // Category mappings for 60/30/10 ratio
  const LOCAL_CATEGORIES = ['local', 'frontiera-transport', 'economie-zel', 'servicii-publice', 'educatie-sanatate'];
  const NATIONAL_CATEGORIES = ['national'];
  const INTERNATIONAL_CATEGORIES = ['ue-romania'];

  /**
   * Initialize dashboard
   */
  function init() {
    // Set up event listeners
    document.getElementById('time-range').addEventListener('change', handleTimeRangeChange);
    document.getElementById('refresh-data').addEventListener('click', refreshDashboard);

    // Initial load
    refreshDashboard();
  }

  /**
   * Handle time range change
   */
  function handleTimeRangeChange(e) {
    const value = e.target.value;
    currentTimeRange = value === 'all' ? Infinity : parseInt(value);
    refreshDashboard();
  }

  /**
   * Filter articles by time range
   */
  function filterArticlesByTimeRange(articles, days) {
    if (days === Infinity) return articles;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return articles.filter(article => {
      const articleDate = new Date(article.date);
      return articleDate >= cutoffDate && !article.draft;
    });
  }

  /**
   * Calculate 60/30/10 ratio
   */
  function calculate603010Ratio(articles) {
    let localCount = 0;
    let nationalCount = 0;
    let internationalCount = 0;

    articles.forEach(article => {
      const categories = Array.isArray(article.categories) ? article.categories : [article.categories];

      categories.forEach(cat => {
        if (LOCAL_CATEGORIES.includes(cat)) localCount++;
        else if (NATIONAL_CATEGORIES.includes(cat)) nationalCount++;
        else if (INTERNATIONAL_CATEGORIES.includes(cat)) internationalCount++;
      });
    });

    const total = localCount + nationalCount + internationalCount;

    if (total === 0) {
      return { local: 0, national: 0, international: 0, total: 0 };
    }

    return {
      local: Math.round((localCount / total) * 100),
      national: Math.round((nationalCount / total) * 100),
      international: Math.round((internationalCount / total) * 100),
      total: total,
      localCount,
      nationalCount,
      internationalCount
    };
  }

  /**
   * Update ratio visualization
   */
  function updateRatioDisplay(ratio) {
    // Update percentages
    document.getElementById('local-percent').textContent = ratio.local;
    document.getElementById('national-percent').textContent = ratio.national;
    document.getElementById('intl-percent').textContent = ratio.international;

    // Update counts
    document.getElementById('total-articles').textContent = ratio.total;
    document.getElementById('local-count').textContent = ratio.localCount;
    document.getElementById('national-count').textContent = ratio.nationalCount;
    document.getElementById('intl-count').textContent = ratio.internationalCount;

    // Update bar widths
    document.querySelectorAll('.ratio-bar-fill').forEach((bar, index) => {
      const values = [ratio.local, ratio.national, ratio.international];
      bar.style.width = values[index] + '%';

      // Color code based on target
      const targets = [60, 30, 10];
      const target = targets[index];
      const value = values[index];

      if (Math.abs(value - target) <= 5) {
        bar.style.background = 'linear-gradient(90deg, #10b981, #34d399)'; // Green - good
      } else if (Math.abs(value - target) <= 15) {
        bar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)'; // Yellow - warning
      } else {
        bar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)'; // Red - bad
      }
    });

    // Update status
    const statusEl = document.getElementById('ratio-status');
    const localDiff = Math.abs(ratio.local - 60);
    const nationalDiff = Math.abs(ratio.national - 30);
    const intlDiff = Math.abs(ratio.international - 10);
    const totalDiff = localDiff + nationalDiff + intlDiff;

    let statusMessage, statusClass;
    if (totalDiff <= 10) {
      statusMessage = '✓ Excelent! Raportul este conform cu ținta 60/30/10';
      statusClass = 'status-good';
    } else if (totalDiff <= 25) {
      statusMessage = '⚠ Raportul necesită ajustări minore';
      statusClass = 'status-warning';
    } else {
      statusMessage = '✗ Raportul este semnificativ diferit de ținta 60/30/10';
      statusClass = 'status-bad';
    }

    statusEl.innerHTML = `<div class="status-indicator ${statusClass}">${statusMessage}</div>`;
  }

  /**
   * Check Cutia Ungheni compliance
   */
  function checkCutiaCompliance(articles) {
    const nonLocalArticles = articles.filter(article => {
      const categories = Array.isArray(article.categories) ? article.categories : [article.categories];
      return categories.some(cat => NATIONAL_CATEGORIES.includes(cat) || INTERNATIONAL_CATEGORIES.includes(cat));
    });

    const withCutia = nonLocalArticles.filter(article => {
      if (!article.cutiaUngheni) return false;

      // Check if at least one field is filled
      const cutia = article.cutiaUngheni;
      return (cutia.impact_local && cutia.impact_local.trim()) ||
             (cutia.ce_se_schimba && cutia.ce_se_schimba.trim()) ||
             (cutia.termene && cutia.termene.trim()) ||
             (cutia.unde_aplici && cutia.unde_aplici.trim());
    });

    const withoutCutia = nonLocalArticles.filter(article => !withCutia.includes(article));

    const compliancePercent = nonLocalArticles.length > 0
      ? Math.round((withCutia.length / nonLocalArticles.length) * 100)
      : 100;

    return {
      total: nonLocalArticles.length,
      withCutia: withCutia.length,
      withoutCutia: withoutCutia.length,
      compliancePercent,
      missingArticles: withoutCutia
    };
  }

  /**
   * Update Cutia Ungheni display
   */
  function updateCutiaDisplay(compliance) {
    // Update percentage
    document.getElementById('cutia-percent').textContent = compliance.compliancePercent;

    // Update counts
    document.getElementById('cutia-with').textContent = compliance.withCutia;
    document.getElementById('cutia-without').textContent = compliance.withoutCutia;

    // Update circle
    const circle = document.getElementById('cutia-circle');
    const circumference = 283; // 2 * PI * 45
    const offset = circumference - (compliance.compliancePercent / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    // Color code
    if (compliance.compliancePercent >= 90) {
      circle.style.stroke = '#10b981'; // Green
    } else if (compliance.compliancePercent >= 70) {
      circle.style.stroke = '#f59e0b'; // Yellow
    } else {
      circle.style.stroke = '#ef4444'; // Red
    }

    // Update missing list
    const listEl = document.getElementById('missing-cutia-items');
    listEl.innerHTML = '';

    if (compliance.missingArticles.length === 0) {
      listEl.innerHTML = '<li style="color: #10b981;">✓ Toate articolele non-locale au Cutia Ungheni!</li>';
    } else {
      compliance.missingArticles.forEach(article => {
        const li = document.createElement('li');
        const categories = Array.isArray(article.categories) ? article.categories : [article.categories];
        li.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a> <small>(${categories.join(', ')})</small>`;
        listEl.appendChild(li);
      });
    }
  }

  /**
   * Calculate format distribution
   */
  function calculateFormatDistribution(articles) {
    const formats = { stire: 0, analiza: 0, explainer: 0, opinie: 0, factcheck: 0 };

    articles.forEach(article => {
      const articleFormats = Array.isArray(article.formats) ? article.formats : [article.formats];
      articleFormats.forEach(fmt => {
        if (formats.hasOwnProperty(fmt)) {
          formats[fmt]++;
        }
      });
    });

    return formats;
  }

  /**
   * Update format distribution display
   */
  function updateFormatDisplay(formats) {
    const total = Object.values(formats).reduce((sum, count) => sum + count, 0);

    Object.keys(formats).forEach(format => {
      const count = formats[format];
      const percent = total > 0 ? (count / total) * 100 : 0;

      document.getElementById(`format-${format}`).textContent = count;

      const barFill = document.querySelector(`.format-item[data-format="${format}"] .format-bar-fill`);
      if (barFill) {
        barFill.style.width = percent + '%';
      }
    });
  }

  /**
   * Get scheduled content
   */
  function getScheduledContent(articles) {
    const now = new Date();

    return articles
      .filter(article => {
        if (!article.publishDate) return false;
        const publishDate = new Date(article.publishDate);
        return publishDate > now;
      })
      .sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
  }

  /**
   * Update scheduled content display
   */
  function updateScheduledDisplay(scheduled) {
    const listEl = document.getElementById('scheduled-list');
    listEl.innerHTML = '';

    if (scheduled.length === 0) {
      listEl.innerHTML = '<div class="empty-state"><p>Niciun articol programat</p></div>';
      return;
    }

    scheduled.forEach(article => {
      const div = document.createElement('div');
      div.className = 'scheduled-item';

      const publishDate = new Date(article.publishDate);
      const dateStr = publishDate.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const categories = Array.isArray(article.categories) ? article.categories : [article.categories];
      const formats = Array.isArray(article.formats) ? article.formats : [article.formats];

      div.innerHTML = `
        <div class="scheduled-date">📅 ${dateStr}</div>
        <div class="scheduled-title"><a href="${article.url}" target="_blank">${article.title}</a></div>
        <div class="scheduled-meta">${categories.join(', ')} · ${formats.join(', ')}</div>
      `;

      listEl.appendChild(div);
    });
  }

  /**
   * Get recent activity
   */
  function getRecentActivity(articles) {
    return articles
      .filter(article => !article.draft)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }

  /**
   * Update recent activity display
   */
  function updateActivityDisplay(recent) {
    const listEl = document.getElementById('activity-list');
    listEl.innerHTML = '';

    recent.forEach(article => {
      const div = document.createElement('div');
      div.className = 'activity-item';

      const date = new Date(article.date);
      const timeAgo = getTimeAgo(date);

      const categories = Array.isArray(article.categories) ? article.categories : [article.categories];
      const formats = Array.isArray(article.formats) ? article.formats : [article.formats];

      div.innerHTML = `
        <div class="activity-time">${timeAgo}</div>
        <div class="activity-title"><a href="${article.url}" target="_blank">${article.title}</a></div>
        <div class="activity-meta">${categories.join(', ')} · ${formats.join(', ')}</div>
      `;

      listEl.appendChild(div);
    });
  }

  /**
   * Calculate time ago
   */
  function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `acum ${diffMins} minute`;
    if (diffHours < 24) return `acum ${diffHours} ore`;
    if (diffDays === 1) return 'ieri';
    if (diffDays < 7) return `acum ${diffDays} zile`;

    return date.toLocaleDateString('ro-RO');
  }

  /**
   * Calculate editorial health score
   */
  function calculateHealthScore(ratio, compliance, formats, articles) {
    let score = 0;

    // 1. Ratio compliance (40 points)
    const localDiff = Math.abs(ratio.local - 60);
    const nationalDiff = Math.abs(ratio.national - 30);
    const intlDiff = Math.abs(ratio.international - 10);
    const ratioDiff = localDiff + nationalDiff + intlDiff;

    let ratioScore = 0;
    if (ratioDiff <= 10) ratioScore = 40;
    else if (ratioDiff <= 25) ratioScore = 30;
    else if (ratioDiff <= 40) ratioScore = 20;
    else ratioScore = 10;

    score += ratioScore;

    // 2. Cutia Ungheni compliance (30 points)
    const cutiaScore = Math.round((compliance.compliancePercent / 100) * 30);
    score += cutiaScore;

    // 3. Format diversity (15 points)
    const activeFormats = Object.values(formats).filter(count => count > 0).length;
    const formatScore = Math.round((activeFormats / 5) * 15);
    score += formatScore;

    // 4. Publishing frequency (15 points)
    const daysInRange = currentTimeRange === Infinity ? 30 : currentTimeRange;
    const articlesPerDay = articles.length / daysInRange;
    let frequencyScore = 0;

    if (articlesPerDay >= 8) frequencyScore = 15; // Target: 8-12 articles/day
    else if (articlesPerDay >= 5) frequencyScore = 12;
    else if (articlesPerDay >= 3) frequencyScore = 8;
    else frequencyScore = 4;

    score += frequencyScore;

    // Calculate grades
    let grade;
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      total: score,
      grade,
      breakdown: {
        ratio: ratioScore,
        cutia: cutiaScore,
        formats: formatScore,
        frequency: frequencyScore
      }
    };
  }

  /**
   * Update health score display
   */
  function updateHealthDisplay(health, ratio, compliance, formats, articles) {
    // Update individual metrics
    document.getElementById('health-ratio').textContent = `${health.breakdown.ratio}/40`;
    document.getElementById('health-ratio-status').textContent = health.breakdown.ratio >= 30 ? '✓' : '⚠';

    document.getElementById('health-cutia').textContent = `${health.breakdown.cutia}/30`;
    document.getElementById('health-cutia-status').textContent = health.breakdown.cutia >= 25 ? '✓' : '⚠';

    document.getElementById('health-formats').textContent = `${health.breakdown.formats}/15`;
    document.getElementById('health-formats-status').textContent = health.breakdown.formats >= 12 ? '✓' : '⚠';

    document.getElementById('health-frequency').textContent = `${health.breakdown.frequency}/15`;
    document.getElementById('health-frequency-status').textContent = health.breakdown.frequency >= 12 ? '✓' : '⚠';

    // Update overall score
    document.getElementById('overall-score').querySelector('.score-number').textContent = health.total;
    document.getElementById('score-grade').textContent = health.grade;

    // Color code grade
    const gradeEl = document.getElementById('score-grade');
    if (health.grade === 'A') gradeEl.style.color = '#10b981';
    else if (health.grade === 'B') gradeEl.style.color = '#3b82f6';
    else if (health.grade === 'C') gradeEl.style.color = '#f59e0b';
    else gradeEl.style.color = '#ef4444';
  }

  /**
   * Refresh entire dashboard
   */
  function refreshDashboard() {
    // Filter articles by time range
    filteredArticles = filterArticlesByTimeRange(articlesData, currentTimeRange);

    // Calculate metrics
    const ratio = calculate603010Ratio(filteredArticles);
    const compliance = checkCutiaCompliance(filteredArticles);
    const formats = calculateFormatDistribution(filteredArticles);
    const scheduled = getScheduledContent(articlesData);
    const recent = getRecentActivity(articlesData);
    const health = calculateHealthScore(ratio, compliance, formats, filteredArticles);

    // Update displays
    updateRatioDisplay(ratio);
    updateCutiaDisplay(compliance);
    updateFormatDisplay(formats);
    updateScheduledDisplay(scheduled);
    updateActivityDisplay(recent);
    updateHealthDisplay(health, ratio, compliance, formats, filteredArticles);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
