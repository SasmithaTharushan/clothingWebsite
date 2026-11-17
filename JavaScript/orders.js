/* "My orders": order history plus the return request form. */

document.addEventListener('DOMContentLoaded', async () => {
  const user = await currentUser();
  if (!user) return location.replace('login.html?next=profile.html');

  document.getElementById('who_name').textContent = user.name || user.email.split('@')[0];
  document.getElementById('who_email').textContent = user.email;
  const adminLink = document.getElementById('admin_link');
  if (adminLink && user.role === 'admin') adminLink.hidden = false;

  document.getElementById('sign_out')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await api('/auth/logout', { method: 'POST' });
    try { localStorage.removeItem('bag'); } catch { /* ignore */ }
    location.href = 'index.html';
  });

  await Promise.all([drawOrders(), drawRefunds()]);
});

async function drawOrders() {
  const host = document.getElementById('orders_host');
  const data = await api('/orders');
  if (!data.success) {
    host.innerHTML = `<p class="load_error">${escapeHtml(data.message)}</p>`;
    return;
  }
  if (!data.orders.length) {
    host.innerHTML = `<p class="confirm_meta">You haven't ordered anything yet.
      <a href="products.html">Start shopping</a>.</p>`;
    return;
  }
  host.innerHTML = data.orders
    .map(
      (o) => `
    <article class="order_card">
      <div class="order_head">
        <span><strong>${escapeHtml(o.orderNo)}</strong></span>
        <span>${new Date(o.createdAt).toLocaleDateString()}</span>
        <span>${money(o.total)}</span>
        <span class="pill pill--${escapeHtml(o.status)}">${escapeHtml(o.status)}</span>
      </div>
      <div class="order_items">
        ${o.items
          .map(
            (i) => `<div class="order_item">
              <img src="${escapeHtml(i.image)}" alt="">
              <div>${escapeHtml(i.name)}<br><small>${i.size ? escapeHtml(i.size) + ' · ' : ''}Qty ${i.quantity}</small></div>
              <span>${money(i.price * i.quantity)}</span>
            </div>`
          )
          .join('')}
      </div>
      <p style="margin-top:.9rem">
        ${o.status === 'Delivered'
          ? `<button class="btn_ghost" data-return="${o._id}">Request a return</button>`
          : '<small class="confirm_meta">Returns open once your order is delivered.</small>'}
      </p>
    </article>`
    )
    .join('');

  host.querySelectorAll('[data-return]').forEach((btn) =>
    btn.addEventListener('click', () => openReturn(btn.dataset.return))
  );
}

function openReturn(orderId) {
  const reason = prompt('What would you like us to know about this return?');
  if (reason === null) return;
  if (!reason.trim()) return notify('Please tell us the reason', 'error');
  api('/refunds', { method: 'POST', body: { orderId, reason } }).then((data) => {
    notify(data.message, data.success ? 'info' : 'error');
    if (data.success) drawRefunds();
  });
}

async function drawRefunds() {
  const host = document.getElementById('refunds_host');
  if (!host) return;
  const data = await api('/refunds');
  if (!data.success || !data.refunds.length) {
    host.innerHTML = '<p class="confirm_meta">No returns in progress.</p>';
    return;
  }
  host.innerHTML = data.refunds
    .map(
      (r) => `<div class="order_card">
        <div class="order_head">
          <span><strong>${escapeHtml(r.orderNo || '')}</strong></span>
          <span>${new Date(r.createdAt).toLocaleDateString()}</span>
          <span>${money(r.amount)}</span>
          <span class="pill pill--${escapeHtml(r.status)}">${escapeHtml(r.status)}</span>
        </div>
        <p style="margin-top:.6rem"><small>${escapeHtml(r.reason)}</small></p>
      </div>`
    )
    .join('');
}
