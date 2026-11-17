/* Checkout: collects a delivery address, shows the order summary, places the
   order through the API, then switches the same page to the confirmation panel. */

const SHIPPING_FEE = 70;
let checkoutLines = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = await currentUser();
  if (!user) {
    location.replace('login.html?next=checkout.html');
    return;
  }

  // Prefill what we already know.
  const emailField = document.getElementById('email');
  if (emailField && !emailField.value) emailField.value = user.email;
  const nameField = document.getElementById('fullName');
  if (nameField && !nameField.value && user.name) nameField.value = user.name;

  await waitForCart();
  checkoutLines = cartLines();
  if (!checkoutLines.length) {
    location.replace('cartPage.html');
    return;
  }
  drawSummary();

  document.getElementById('checkoutForm')?.addEventListener('submit', placeOrder);
});

/* cart.js loads products asynchronously; give it a moment to finish. */
function waitForCart() {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (cartLines().length || Date.now() - started > 4000) return resolve();
      setTimeout(tick, 100);
    };
    tick();
  });
}

function drawSummary() {
  const host = document.getElementById('summary_lines');
  if (!host) return;
  host.innerHTML = checkoutLines
    .map(
      (l) => `
      <div class="summary_line">
        <img src="${escapeHtml(l.product.images[0])}" alt="">
        <div>
          <p class="summary_name">${escapeHtml(l.product.name)}</p>
          <p class="summary_meta">${l.size ? escapeHtml(l.size) + ' · ' : ''}Qty ${l.quantity}</p>
        </div>
        <span class="summary_price">${money(l.product.price * l.quantity)}</span>
      </div>`
    )
    .join('');

  const subtotal = cartSubtotal();
  setIf('sum_subtotal', money(subtotal));
  setIf('sum_shipping', money(SHIPPING_FEE));
  setIf('sum_total', money(subtotal + SHIPPING_FEE));
}

function setIf(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

async function placeOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('place_order');
  btn.disabled = true;
  btn.textContent = 'Placing your order…';

  const address = {};
  for (const f of ['fullName', 'email', 'phone', 'street', 'city', 'postcode', 'country']) {
    address[f] = document.getElementById(f)?.value.trim() || '';
  }

  const items = checkoutLines.map((l) => ({ productId: l.productId, size: l.size, quantity: l.quantity }));
  const data = await api('/orders', { method: 'POST', body: { items, address } });

  btn.disabled = false;
  btn.textContent = 'Place order';
  if (!data.success) return notify(data.message, 'error');

  // The server emptied the account bag; clear the local copy too.
  cart = [];
  try {
    localStorage.removeItem('bag');
  } catch {
    /* ignore */
  }
  showConfirmation(data.order);
}

function showConfirmation(order) {
  document.getElementById('checkout_step')?.setAttribute('hidden', '');
  const panel = document.getElementById('confirm_step');
  if (!panel) return;
  panel.removeAttribute('hidden');

  setIf('order_no', order.orderNo);
  setIf('order_total', money(order.total));
  const date = document.getElementById('order_date');
  if (date) {
    date.textContent = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  showCheckAnimation();
  window.scrollTo(0, 0);
}

function showCheckAnimation() {
  const host = document.getElementById('checkoutIcon');
  if (!host || typeof lottie === 'undefined') return;
  host.innerHTML = '';
  const el = document.createElement('div');
  el.style.width = '200px';
  el.style.height = '200px';
  host.appendChild(el);
  lottie.loadAnimation({
    container: el,
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: 'json/AnimationCheckoutPage.json',
  });
}

function backHome() {
  location.href = 'index.html';
}
