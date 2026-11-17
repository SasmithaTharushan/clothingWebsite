/* Product page: size picker, stock-aware quantity and add-to-bag. */

let detailProduct = null;
let chosenSize = null;

document.addEventListener('DOMContentLoaded', async () => {
  const productId = new URL(location.href).searchParams.get('productId');
  if (!productId) return showMissing();

  const data = await api(`/products/${productId}`);
  if (!data.success) return showMissing(data.message);
  detailProduct = data.product;
  render(detailProduct);
});

function showMissing(message = "We couldn't find that product.") {
  const host = document.querySelector('.productDetails');
  if (host) {
    host.innerHTML = `<div class="not_found"><h2>${escapeHtml(message)}</h2>
      <a class="btn_primary" href="products.html">Back to the shop</a></div>`;
  }
}

function render(product) {
  const host = document.querySelector('.productDetails');
  if (host) host.setAttribute('data-id', product.id || product._id);

  document.title = `${product.name} | Piyarathna Tex`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', product.description.slice(0, 155));

  const img = document.getElementById('product_image');
  if (img) {
    img.src = product.images[0];
    img.alt = product.name;
  }
  setText('.category_name', product.category);
  setText('.product_name', product.name);
  setText('.product_price', money(product.price));
  setText('.product_des', product.description);

  drawThumbs(product);
  drawSizes(product);

  const add = document.getElementById('btn_add');
  add?.addEventListener('click', (e) => {
    e.preventDefault();
    const qty = parseInt(document.getElementById('productCount')?.value, 10) || 1;
    if (addToCart(product.id || product._id, chosenSize, qty)) showToast();
  });
}

function setText(sel, text) {
  const el = document.querySelector(sel);
  if (el) el.textContent = text;
}

function drawThumbs(product) {
  const host = document.querySelector('.thumbs');
  if (!host || product.images.length < 2) return;
  host.innerHTML = product.images
    .map(
      (src, i) =>
        `<button class="thumb${i === 0 ? ' active' : ''}" aria-label="View image ${i + 1}"><img src="${escapeHtml(src)}" alt=""></button>`
    )
    .join('');
  host.querySelectorAll('.thumb').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      document.getElementById('product_image').src = product.images[i];
      host.querySelectorAll('.thumb').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function drawSizes(product) {
  const host = document.querySelector('.size_options');
  if (!host) return;
  if (!product.sizes?.length) {
    host.closest('.size_picker')?.remove();
    return;
  }
  host.innerHTML = product.sizes
    .map(
      (s) =>
        `<button type="button" class="size_btn" data-size="${escapeHtml(s.size)}" ${s.stock === 0 ? 'disabled' : ''}
          title="${s.stock === 0 ? 'Sold out' : `${s.stock} in stock`}">${escapeHtml(s.size)}</button>`
    )
    .join('');

  const note = document.getElementById('stock_note');
  host.querySelectorAll('.size_btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      host.querySelectorAll('.size_btn').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      chosenSize = btn.dataset.size;
      const stock = product.sizes.find((s) => s.size === chosenSize)?.stock ?? 0;
      if (note) note.textContent = stock <= 3 ? `Only ${stock} left in ${chosenSize}` : `In stock`;
    });
  });

  // Preselect the first size that is actually available.
  host.querySelector('.size_btn:not([disabled])')?.click();
  if (!product.inStock && note) note.textContent = 'This product is sold out';
}

function showToast() {
  const overlay = document.getElementById('toast-overlay');
  if (!overlay) return notify('Added to your bag');
  overlay.classList.add('show');
  showCheckAnimation();
  setTimeout(() => {
    overlay.classList.remove('show');
    document.body.classList.add('showCart');
  }, 1000);
}

function showCheckAnimation() {
  const host = document.getElementById('checkIcon');
  if (!host || typeof lottie === 'undefined') return;
  host.innerHTML = '';
  const el = document.createElement('div');
  el.style.width = '100px';
  el.style.height = '100px';
  host.appendChild(el);
  lottie.loadAnimation({ container: el, renderer: 'svg', loop: false, autoplay: true, path: 'json/Animation check.json' });
}

document.addEventListener('DOMContentLoaded', () => {
  const qty = document.getElementById('productCount');
  document.getElementById('minus')?.addEventListener('click', () => {
    qty.value = Math.max(1, (parseInt(qty.value, 10) || 1) - 1);
  });
  document.getElementById('plus')?.addEventListener('click', () => {
    qty.value = Math.min(99, (parseInt(qty.value, 10) || 1) + 1);
  });
});
