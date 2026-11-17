/* Shop listing: loads the catalogue from the API, filters by category and search. */

let productsContainer = [];
let allProducts = [];
let activeCategory = null;
const linkName = document.getElementsByClassName('categories_link');

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.querySelector('.products .content');
  if (grid) grid.innerHTML = skeletons(8);

  const data = await api('/products');
  if (!data.success) {
    if (grid) grid.innerHTML = `<p class="load_error">${escapeHtml(data.message)}</p>`;
    return;
  }
  allProducts = data.products;

  // Allow /products.html?category=Woman and ?q=dress
  const params = new URLSearchParams(location.search);
  activeCategory = params.get('category');
  const q = params.get('q');
  const search = document.getElementById('shop_search');
  if (search && q) search.value = q;
  if (activeCategory) {
    const link = [...linkName].find((l) => l.getAttribute('productCategory') === activeCategory);
    if (link) setActiveLink(link);
  }
  applyFilters();
});

const skeletons = (n) => Array.from({ length: n }, () => '<div class="product-card skeleton"></div>').join('');

function applyFilters() {
  const q = (document.getElementById('shop_search')?.value || '').trim().toLowerCase();
  productsContainer = allProducts.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (q && !`${p.name} ${p.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
  sortProducts();
  displayProducts();
}

function sortProducts() {
  const how = document.getElementById('sort')?.value || 'featured';
  const by = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    az: (a, b) => a.name.localeCompare(b.name),
    za: (a, b) => b.name.localeCompare(a.name),
    featured: (a, b) => Number(Boolean(b.isTrending)) - Number(Boolean(a.isTrending)),
  }[how];
  if (by) productsContainer.sort(by);
}

function displayProducts() {
  const count = document.getElementById('productCount');
  if (count) count.textContent = `${productsContainer.length} Products`;

  const grid = document.querySelector('.products .content');
  if (!grid) return;

  if (!productsContainer.length) {
    grid.innerHTML = `<p class="load_error">No products match that search.</p>`;
    return;
  }

  grid.innerHTML = productsContainer
    .map((p) => {
      const id = p.id || p._id;
      const sold = !p.inStock;
      return `
      <div class="product-card${sold ? ' sold_out' : ''}" data-id="${id}">
        <div class="card-img">
            <a href="ProductDetails.html?productId=${id}">
              <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" loading="lazy">
            </a>
            ${sold ? '<span class="sold_badge">Sold out</span>' : ''}
            <a href="ProductDetails.html?productId=${id}" class="addToCart" aria-label="View ${escapeHtml(p.name)}">
                <ion-icon name="cart-outline" class="Cart"></ion-icon>
            </a>
        </div>
        <div class="card-info">
             <a class="product-name" href="ProductDetails.html?productId=${id}">${escapeHtml(p.name)}</a>
             <h5 class="product-price">${money(p.price)}</h5>
        </div>
      </div>`;
    })
    .join('');
}

function getCategory(e) {
  e.preventDefault();
  const category = e.target.getAttribute('productCategory');
  activeCategory = category || null;
  setActiveLink(e.target);
  applyFilters();
  if (window.innerWidth <= 768) toggleSidebar();
}

function setActiveLink(activeLink) {
  Array.from(linkName).forEach((l) => l.classList.remove('active'));
  activeLink.classList.add('active');
}

Array.from(linkName).forEach((el) => el.addEventListener('click', getCategory));

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sort')?.addEventListener('change', applyFilters);
  const search = document.getElementById('shop_search');
  if (!search) return;
  let t;
  search.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(applyFilters, 200);
  });
});

function toggleSidebar() {
  document.querySelector('.aside')?.classList.toggle('open');
}
