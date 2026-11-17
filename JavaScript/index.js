var currentSlide = 1;
window.addEventListener("load",function(){
    // slider not run in small window
    if (window.innerWidth > 767) {
    if (document.querySelectorAll(".slider .slide-content").length > 0) {
        theChecker();
        playSlider();
    }
    }
    getTrendingProducts();
});

function nextSlider() {
    var btnNext = document.getElementsByClassName("next")[0];
    if (!btnNext || btnNext.classList.contains('disabled')) {
        return false;
    } else {
        currentSlide++;
        theChecker();
    }
}

function prevSlider() {
    var btnPrev = document.getElementsByClassName("prev")[0];
    if (!btnPrev || btnPrev.classList.contains('disabled')) {
        return false;
    } else {
        currentSlide--;
        theChecker();
    }
}

function theChecker() {
    var imgSlider = document.querySelectorAll(".slide-content");
    var btnNext = document.getElementsByClassName("next")[0];
    var btnPrev = document.getElementsByClassName("prev")[0];
    if (!btnNext || !btnPrev) return;
    imgSlider.forEach(function (img) {
        img.classList.remove('active');
    });

    if (!imgSlider.length) return;
    imgSlider[currentSlide - 1]?.classList.add('active');

    if (currentSlide == 1) {
        btnPrev.classList.add('disabled');
    } else {
        btnPrev.classList.remove('disabled');
    }

    if (currentSlide == imgSlider.length) {
        btnNext.classList.add('disabled');
    } else {
        btnNext.classList.remove('disabled');
    }
}
function playSlider() {
   var imgSlider = document.querySelectorAll(".slide-content");
   setInterval(function() {
        if (currentSlide < imgSlider.length) {
            currentSlide++;
        } else {
            currentSlide = 1;
        }
        theChecker();
    }, 3000);
}

async function getTrendingProducts() {
    const host = document.querySelector(".top_products .products");
    if (!host) return;
    const data = await api('/products');
    if (!data.success) {
        host.innerHTML = `<p class="load_error">${escapeHtml(data.message)}</p>`;
        return;
    }
    const trending = data.products.filter((p) => p.isTrending).slice(0, 8);
    displayTrendingProducts(trending.length ? trending : data.products.slice(0, 8));
}

function displayTrendingProducts(items) {
    const host = document.querySelector(".top_products .products");
    if (!host) return;
    host.innerHTML = items
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
        .join("");
}

function showCart(){
    let body = document.querySelector('body');
    body.classList.add('showCart');
}
function displayDetails(productId){
    window.location.href = `ProductDetails.html?productId=${productId}`;
}