/**
 * ClassHub Shared Utilities
 * Toasts, spinner overlay, date/time formatting, form helpers.
 */
const ChUtils = (() => {

  // ---------------- Toast Notifications ----------------
  const ensureToastContainer = () => {
    let el = document.getElementById('chToastContainer');
    if (!el) {
      el = document.createElement('div');
      el.id = 'chToastContainer';
      document.body.appendChild(el);
    }
    return el;
  };

  const toast = (message, type = 'success') => {
    const container = ensureToastContainer();
    const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' };
    const colors = { success: '#16a34a', error: '#dc2626', warning: '#d97706', info: '#0284c7' };

    const el = document.createElement('div');
    el.className = 'toast align-items-center border-0 show mb-2';
    el.style.cssText = `background:var(--ch-surface); border-left:4px solid ${colors[type]}; border-radius:10px; box-shadow:var(--ch-shadow-lg); min-width:300px;`;
    el.innerHTML = `
      <div class="d-flex align-items-center px-3 py-3">
        <i class="bi ${icons[type]} me-2" style="color:${colors[type]}; font-size:1.2rem;"></i>
        <div class="flex-grow-1" style="color:var(--ch-text); font-weight:600; font-size:.9rem;">${message}</div>
        <button type="button" class="btn-close ms-2" style="font-size:.7rem;"></button>
      </div>`;
    container.appendChild(el);

    el.querySelector('.btn-close').addEventListener('click', () => el.remove());
    setTimeout(() => el.remove(), 4500);
  };

  // ---------------- Loading Spinner ----------------
  let spinnerEl = null;
  const showSpinner = () => {
    if (spinnerEl) return;
    spinnerEl = document.createElement('div');
    spinnerEl.className = 'ch-spinner-overlay';
    spinnerEl.innerHTML = '<div class="ch-spinner"></div>';
    document.body.appendChild(spinnerEl);
  };
  const hideSpinner = () => {
    if (spinnerEl) { spinnerEl.remove(); spinnerEl = null; }
  };

  // ---------------- Formatters ----------------
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
           d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${m} ${period}`;
  };

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const intervals = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (const [name, secs] of intervals) {
      const count = Math.floor(seconds / secs);
      if (count >= 1) return `${count} ${name}${count > 1 ? 's' : ''} ago`;
    }
    return 'just now';
  };

  const initials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  };

  const fileUrl = (path) => path ? `${CH_CONFIG.FILE_BASE_URL}${path}` : '#';

  const escapeHtml = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const todayISO = () => new Date().toISOString().split('T')[0];

  const emptyState = (icon, message) => `
    <div class="ch-empty-state">
      <i class="bi ${icon}"></i>
      <p class="mb-0">${message}</p>
    </div>`;

  const confirmAction = (message) => window.confirm(message);

  return {
    toast, showSpinner, hideSpinner, formatDate, formatDateTime, formatTime,
    timeAgo, initials, fileUrl, escapeHtml, todayISO, emptyState, confirmAction
  };
})();
