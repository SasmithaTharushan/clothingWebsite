/* Admin panel: dashboard, catalogue, inventory, orders and refunds.
   Every page here is gated on the session cookie carrying role === 'admin';
   the API enforces the same thing, so hiding the UI is only a convenience. */

const ORDER_STATUSES = ['Placed', 'Packing', 'Shipped', 'Delivered', 'Cancelled'];
const REFUND_STATUSES = ['Requested', 'Approved', 'Rejected', 'Refunded'];
const CATEGORIES = ['Woman', 'Man', 'Accessories', 'Jewelry', 'Bags'];

document.addEventListener('DOMContentLoaded', async () => {
  const user = await currentUser();
  if (!user) return location.replace('login.html?next=' + encodeURIComponent(location.pathname.replace(/^\//, '')));
  if (user.role !== 'admin') {
    document.body.innerHTML =
      '<main class="ui_page"><h1>Admins only</h1><p>This area is for store staff. ' +
      '<a href="index.html">Back to the shop</a></p></main>';
    return;
  }
  document.querySelectorAll('.admin_who').forEach((el) => (el.textContent = user.name || user.email));
  document.getElementById('admin_logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await api('/auth/logout', { method: 'POST' });
    location.href = 'index.html';
  });

  ({
    dashboard: initDashboard,
    products: initProducts,
    add: initAddProduct,
    orders: initOrders,
    refunds: initRefunds,
  })[document.body.dataset.admin]?.();
});

/* ---------------- Dashboard ---------------- */
async function initDashboard() {
  const data = await api('/admin/stats');
  if (!data.success) return notify(data.message, 'error');
  const s = data.stats;
  setStat('stat_orders', s.orders);
  setStat('stat_revenue', money(s.revenue));
  setStat('stat_products', s.products);
  setStat('stat_customers', s.customers);
  setStat('stat_refunds', s.pendingRefunds);

  const low = document.getElementById('low_stock');
  if (!low) return;
  low.innerHTML = s.lowStock.length
    ? s.lowStock.map((p) => `<li><strong>${escapeHtml(p.name)}</strong> — ${escapeHtml(p.sizes.join(', '))}</li>`).join('')
    : '<li>Everything is well stocked.</li>';
}

function setStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* ---------------- Catalogue + inventory ---------------- */
async function initProducts() {
  await drawProducts();
}

async function drawProducts() {
  const body = document.getElementById('product_rows');
  if (!body) return;
  body.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';

  const data = await api('/products');
  if (!data.success) {
    body.innerHTML = `<tr><td colspan="5">${escapeHtml(data.message)}</td></tr>`;
    return;
  }
  if (!data.products.length) {
    body.innerHTML = '<tr><td colspan="5">No products yet. Add your first one.</td></tr>';
    return;
  }

  body.innerHTML = data.products
    .map(
      (p) => `
      <tr data-id="${p._id}">
        <td><img src="${escapeHtml(p.images[0])}" alt=""></td>
        <td>
          <strong>${escapeHtml(p.name)}</strong><br>
          <small>${escapeHtml(p.category)}${p.isTrending ? ' · featured' : ''}</small>
        </td>
        <td>${money(p.price)}</td>
        <td>
          <div class="stock_cell">
            ${p.sizes
              .map(
                (s) => `<span class="stock_chip${s.stock === 0 ? ' out' : ''}">
                  <button data-act="dec" data-size="${escapeHtml(s.size)}" aria-label="Reduce ${escapeHtml(s.size)}">−</button>
                  ${escapeHtml(s.size)}: <strong>${s.stock}</strong>
                  <button data-act="inc" data-size="${escapeHtml(s.size)}" aria-label="Add ${escapeHtml(s.size)}">+</button>
                </span>`
              )
              .join('') || '<small>No sizes</small>'}
          </div>
        </td>
        <td><button class="btn_danger" data-act="del">Delete</button></td>
      </tr>`
    )
    .join('');

  body.querySelectorAll('button[data-act]').forEach((btn) => btn.addEventListener('click', onProductAction));
}

async function onProductAction(e) {
  const btn = e.currentTarget;
  const row = btn.closest('tr');
  const id = row.dataset.id;
  const act = btn.dataset.act;

  if (act === 'del') {
    const name = row.querySelector('strong').textContent;
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const data = await api(`/admin/products/${id}`, { method: 'DELETE' });
    if (!data.success) return notify(data.message, 'error');
    notify(data.message);
    return drawProducts();
  }

  btn.disabled = true;
  const data = await api(`/admin/products/${id}/stock`, {
    method: 'POST',
    body: { size: btn.dataset.size, delta: act === 'inc' ? 1 : -1 },
  });
  btn.disabled = false;
  if (!data.success) return notify(data.message, 'error');
  drawProducts();
}

/* ---------------- Add product ---------------- */
function initAddProduct() {
  const form = document.getElementById('addProductForm');
  const cat = document.getElementById('category');
  if (cat) {
    cat.innerHTML =
      '<option value="">Select a category</option>' +
      CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');
    cat.addEventListener('change', drawSizeRows);
  }

  // Live previews for the four image slots
  document.querySelectorAll('.upload_slot').forEach((input) => {
    input.addEventListener('change', () => {
      const img = input.parentElement.querySelector('img');
      if (input.files[0]) img.src = URL.createObjectURL(input.files[0]);
    });
  });

  form?.addEventListener('submit', submitProduct);
  drawSizeRows();
}

function sizeSetFor(category, name = '') {
  if (/sneaker|sandal|mule|slide|shoe/i.test(name)) return ['UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8'];
  if ((category === 'Woman' || category === 'Man') && !/beanie|hat|cap/i.test(name)) return ['XS', 'S', 'M', 'L', 'XL'];
  return ['One Size'];
}

function drawSizeRows() {
  const host = document.getElementById('size_rows');
  if (!host) return;
  const sizes = sizeSetFor(document.getElementById('category')?.value, document.getElementById('name')?.value);
  host.innerHTML = sizes
    .map(
      (s) => `<div class="ui_field" style="display:flex;gap:.6rem;align-items:center">
        <label style="min-width:70px;margin:0">${escapeHtml(s)}</label>
        <input type="number" min="0" value="5" data-size="${escapeHtml(s)}" aria-label="Stock for ${escapeHtml(s)}">
      </div>`
    )
    .join('');
}

/* Shrink before upload — Vercel rejects bodies over roughly 4.5 MB. */
async function compressImage(file, maxSize = 1200, quality = 0.85) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', quality));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
}

async function submitProduct(e) {
  e.preventDefault();
  const btn = document.getElementById('save_product');
  const files = [...document.querySelectorAll('.upload_slot')].map((i) => i.files[0]).filter(Boolean);
  if (!files.length) return notify('Add at least one image', 'error');

  const sizes = [...document.querySelectorAll('#size_rows input')].map((i) => ({
    size: i.dataset.size,
    stock: Number(i.value) || 0,
  }));

  btn.disabled = true;
  btn.textContent = 'Uploading…';
  try {
    const form = new FormData();
    form.append(
      'data',
      JSON.stringify({
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        price: document.getElementById('price').value,
        description: document.getElementById('description').value,
        sku: document.getElementById('sku').value,
        isTrending: document.getElementById('isTrending').checked,
        sizes,
      })
    );
    for (const f of files) form.append('images', await compressImage(f));

    const data = await api('/admin/products', { method: 'POST', form });
    if (!data.success) return notify(data.message, 'error');
    notify(data.message);
    e.target.reset();
    document.querySelectorAll('.upload_slot').forEach((i) => {
      i.parentElement.querySelector('img').src = 'images/check.png';
    });
    drawSizeRows();
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add product';
  }
}

/* ---------------- Orders ---------------- */
async function initOrders() {
  const body = document.getElementById('order_rows');
  body.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';
  const data = await api('/admin/orders');
  if (!data.success) {
    body.innerHTML = `<tr><td colspan="5">${escapeHtml(data.message)}</td></tr>`;
    return;
  }
  if (!data.orders.length) {
    body.innerHTML = '<tr><td colspan="5">No orders yet.</td></tr>';
    return;
  }
  body.innerHTML = data.orders
    .map(
      (o) => `
      <tr data-id="${o._id}">
        <td><strong>${escapeHtml(o.orderNo)}</strong><br><small>${new Date(o.createdAt).toLocaleDateString()}</small></td>
        <td>${escapeHtml(o.address.fullName)}<br><small>${escapeHtml(o.address.city)}, ${escapeHtml(o.address.country)}<br>${escapeHtml(o.address.phone)}</small></td>
        <td>${o.items.map((i) => `${escapeHtml(i.name)}${i.size ? ` (${escapeHtml(i.size)})` : ''} × ${i.quantity}`).join('<br>')}</td>
        <td>${money(o.total)}</td>
        <td>
          <select class="order_status" aria-label="Order status">
            ${ORDER_STATUSES.map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>`
    )
    .join('');

  body.querySelectorAll('.order_status').forEach((sel) =>
    sel.addEventListener('change', async () => {
      const id = sel.closest('tr').dataset.id;
      const data = await api(`/admin/orders/${id}`, { method: 'PATCH', body: { status: sel.value } });
      notify(data.message, data.success ? 'info' : 'error');
    })
  );
}

/* ---------------- Refunds ---------------- */
async function initRefunds() {
  const body = document.getElementById('refund_rows');
  body.innerHTML = '<tr><td colspan="5">Loading…</td></tr>';
  const data = await api('/admin/refunds');
  if (!data.success) {
    body.innerHTML = `<tr><td colspan="5">${escapeHtml(data.message)}</td></tr>`;
    return;
  }
  if (!data.refunds.length) {
    body.innerHTML = '<tr><td colspan="5">No refund requests.</td></tr>';
    return;
  }
  body.innerHTML = data.refunds
    .map(
      (r) => `
      <tr data-id="${r._id}">
        <td><strong>${escapeHtml(r.orderNo || '')}</strong></td>
        <td>${new Date(r.createdAt).toLocaleDateString()}</td>
        <td>${escapeHtml(r.reason)}</td>
        <td>${money(r.amount)}</td>
        <td>
          <select class="refund_status" aria-label="Refund status">
            ${REFUND_STATUSES.map((s) => `<option ${s === r.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>`
    )
    .join('');

  body.querySelectorAll('.refund_status').forEach((sel) =>
    sel.addEventListener('change', async () => {
      const id = sel.closest('tr').dataset.id;
      const data = await api(`/admin/refunds/${id}`, { method: 'PATCH', body: { status: sel.value } });
      notify(data.message, data.success ? 'info' : 'error');
    })
  );
}
