/* Shared helpers: API calls, money formatting and toast messages.
   Loaded before every other script on the page. */

async function api(path, { method = 'GET', body, form } = {}) {
  const opts = { method, credentials: 'include' };
  if (form) opts.body = form;
  else if (body !== undefined) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  try {
    const res = await fetch(`/api${path}`, opts);
    const data = await res.json().catch(() => ({}));
    if (typeof data.success !== 'boolean') data.success = res.ok;
    if (!data.success && !data.message) data.message = `Request failed (${res.status})`;
    data.status = res.status;
    return data;
  } catch {
    return { success: false, status: 0, message: 'Network error — check your connection' };
  }
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

/* Small toast, so pages stop relying on alert() */
function notify(message, kind = 'info') {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  el.textContent = message;
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3200);
}

/* Who is logged in. Cached for the life of the page. */
let _mePromise = null;
function currentUser() {
  if (!_mePromise) _mePromise = api('/auth/me').then((d) => (d.success ? d.user : null));
  return _mePromise;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
