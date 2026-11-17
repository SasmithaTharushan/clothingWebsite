/* The shopping bag.
   Guests keep their bag in localStorage; once signed in it syncs to the account,
   so it survives switching device. Lines are keyed by product + size. */

const CART_KEY = 'bag';
const SHIPPING = 70;

let cart = [];
let products = [];
let cartUser = null;

const $ = (id) => document.getElementById(id);
const cartCounter = $('cart-counter');
const cartItemsCount = $('cart_counts');
const cartTextElements = document.querySelectorAll('.cart_products');
const btnControl = document.querySelector('.btn_control');
const cartTotal = document.querySelector('.cart_total');

const lineKey = (id, size) => `${id}__${size || ''}`;

function readLocal() {
  try {
    const v = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function writeLocal() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* private mode — the bag just won't persist */
  }
}

let syncTimer;
function persist() {
  writeLocal();
  if (!cartUser) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => api('/cart', { method: 'POST', body: { cart } }), 400);
}

async function initCart() {
  cart = readLocal();
  const [list, user] = await Promise.all([api('/products'), currentUser()]);
  products = list.success ? list.products : [];
  cartUser = user;

  if (cartUser) {
    const remote = await api('/cart');
    if (remote.success) {
      // Merge: keep the larger quantity for any line in both bags.
      const merged = new Map(remote.cart.map((i) => [lineKey(i.productId, i.size), { ...i }]));
      for (const i of cart) {
        const k = lineKey(i.productId, i.size);
        const hit = merged.get(k);
        if (hit) hit.quantity = Math.max(hit.quantity, i.quantity);
        else merged.set(k, { ...i });
      }
      const next = [...merged.values()];
      const changed = JSON.stringify(next) !== JSON.stringify(remote.cart);
      cart = next;
      writeLocal();
      if (changed) api('/cart', { method: 'POST', body: { cart } });
    }
  }

  dropMissingProducts();
  renderCart();
}

/* A product deleted by the admin shouldn't linger in anyone's bag. */
function dropMissingProducts() {
  if (!products.length) return;
  const ids = new Set(products.map((p) => p.id || p._id));
  const before = cart.length;
  cart = cart.filter((i) => ids.has(i.productId));
  if (cart.length !== before) persist();
}

const findProduct = (id) => products.find((p) => (p.id || p._id) === id);

function stockFor(product, size) {
  if (!product?.sizes?.length) return Infinity;
  return product.sizes.find((s) => s.size === size)?.stock ?? 0;
}

function addToCart(productId, size, quantity = 1) {
  const product = findProduct(productId);
  if (!product) return;

  if (product.sizes?.length && !size) {
    notify('Please choose a size first', 'error');
    return false;
  }
  const line = cart.find((i) => i.productId === productId && i.size === size);
  const already = line?.quantity || 0;
  const available = stockFor(product, size);

  if (already + quantity > available) {
    notify(available === 0 ? 'That size is sold out' : `Only ${available} left in that size`, 'error');
    return false;
  }
  if (line) line.quantity += quantity;
  else cart.push({ productId, size: size || '', quantity });

  persist();
  renderCart();
  return true;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  persist();
  renderCart();
}

function changeQuantity(index, delta) {
  const line = cart[index];
  if (!line) return;
  const next = line.quantity + delta;
  if (next < 1) return removeFromCart(index);

  const available = stockFor(findProduct(line.productId), line.size);
  if (next > available) return notify(`Only ${available} left in that size`, 'error');

  line.quantity = next;
  persist();
  renderCart();
}

function cartLines() {
  return cart
    .map((i) => {
      const p = findProduct(i.productId);
      return p ? { ...i, product: p } : null;
    })
    .filter(Boolean);
}

const cartSubtotal = () =>
  Math.round(cartLines().reduce((s, l) => s + l.product.price * l.quantity, 0) * 100) / 100;

function renderCart() {
  const lines = cartLines();
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  if (cartCounter) cartCounter.textContent = count;

  if (!lines.length) {
    cartTextElements.forEach((el) => {
      el.classList.add('empty');
      el.innerHTML = 'Your bag is empty';
    });
    if (btnControl) btnControl.style.display = 'none';
    if (cartTotal) cartTotal.style.display = 'none';
  } else {
    cartTextElements.forEach((el) => el.classList.remove('empty'));
    drawLines(lines);
    if (btnControl) btnControl.style.display = 'flex';
    if (cartTotal) cartTotal.style.display = 'flex';
  }

  const subtotal = cartSubtotal();
  const totalPrice = $('total_price');
  if (totalPrice) totalPrice.textContent = money(subtotal);
  updateCartPage(subtotal, count);
}

function drawLines(lines) {
  const html = lines
    .map(
      (l, index) => `
      <div class="cart_product">
          <div class="cart_product_img">
              <img src="${escapeHtml(l.product.images[0])}" alt="${escapeHtml(l.product.name)}">
          </div>
          <div class="cart_product_info">
              <div class="top_card">
                  <div class="left_card">
                      <h4 class="product_name">${escapeHtml(l.product.name)}</h4>
                      <span class="product_price">${money(l.product.price)}</span>
                      ${l.size ? `<span class="product_size">Size: ${escapeHtml(l.size)}</span>` : ''}
                  </div>
                  <button class="remove_product" aria-label="Remove ${escapeHtml(l.product.name)}" onclick="removeFromCart(${index})">
                      <ion-icon name="close-outline"></ion-icon>
                  </button>
              </div>
              <div class="buttom_card">
                  <div class="counts">
                      <button class="counts_btns minus" aria-label="Decrease quantity" onclick="changeQuantity(${index}, -1)">-</button>
                      <span class="product_count">${l.quantity}</span>
                      <button class="counts_btns plus" aria-label="Increase quantity" onclick="changeQuantity(${index}, 1)">+</button>
                  </div>
                  <span class="total_price">${money(l.product.price * l.quantity)}</span>
              </div>
          </div>
      </div>`
    )
    .join('');
  cartTextElements.forEach((el) => (el.innerHTML = html));
}

/* The dedicated bag page has its own summary panel. */
function updateCartPage(subtotal, count) {
  if (!cartItemsCount) return;
  cartItemsCount.textContent = `(${count} item${count === 1 ? '' : 's'})`;
  const sub = $('Subtotal');
  const total = $('total_order');
  const delivery = $('Delivery');
  const shipping = count ? SHIPPING : 0;
  if (sub) sub.textContent = money(subtotal);
  if (delivery) delivery.textContent = money(shipping);
  if (total) total.textContent = money(subtotal + shipping);
}

async function checkOut() {
  if (!cartLines().length) return notify('Your bag is empty', 'error');
  const user = await currentUser();
  if (!user) {
    notify('Please log in to check out');
    location.href = 'login.html?next=checkout.html';
    return;
  }
  location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', initCart);
