const scrollBtn = document.getElementById("scrollBtn");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (!scrollBtn) return;
    const scrolled = document.body.scrollTop > 20 || document.documentElement.scrollTop > 20;
    scrollBtn.style.display = scrolled ? "block" : "none";
}

scrollBtn?.addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// nav 
var nav = document.getElementById('header');
var scrollUp = "scroll-up";
var scrollDown = "scroll-down";
var lastScroll = 0;

if (window.addEventListener) {
    window.addEventListener("scroll", scrollHandler);
} else {
    window.attachEvent("scroll", scrollHandler);
}

function scrollHandler() {
     if (!nav) return;
     var currentScroll = window.pageYOffset;
     if (currentScroll === 0) {
         nav.classList.remove(scrollDown);
         nav.classList.remove(scrollUp);
        return;
     }
     if (currentScroll > lastScroll && !nav.classList.contains(scrollDown)) {
                // down
        nav.classList.remove(scrollUp);
        nav.classList.add(scrollDown);
    } 
    else if (currentScroll < lastScroll && nav.classList.contains(scrollDown)) {
                // up
        nav.classList.remove(scrollDown);
        nav.classList.add(scrollUp);
    }
    lastScroll = currentScroll;
}

// cart 
let closeCart = document.querySelector('.closeCart');
let iconCart = document.querySelector('.icon-cart');
let body = document.querySelector('body');

iconCart?.addEventListener('click', () => {
    body.classList.toggle('showCart');
})
closeCart?.addEventListener('click', () => {
    body.classList.toggle('showCart');
})

function viewCart(){
    window.location.href = "cartPage.html"
}

/* Header auth state comes from the session cookie, not localStorage. */
async function setupUI() {
    const logoutBox = document.getElementById("display_login");
    const loginBtn = document.getElementById("login_btn");
    const nameEl = document.getElementById("user_name");
    if (!logoutBox && !loginBtn) return;

    const user = await currentUser();
    if (user) {
        if (logoutBox) logoutBox.style.display = "flex";
        if (loginBtn) loginBtn.style.display = "none";
        if (nameEl) nameEl.textContent = user.name ? user.name.split(" ")[0] : user.email;
        document.querySelectorAll(".admin_only").forEach((el) => {
            el.style.display = user.role === "admin" ? "" : "none";
        });
    } else {
        if (logoutBox) logoutBox.style.display = "none";
        if (loginBtn) loginBtn.style.display = "inline-block";
        document.querySelectorAll(".admin_only").forEach((el) => (el.style.display = "none"));
    }
}

async function logout(e) {
    e?.preventDefault();
    await api('/auth/logout', { method: 'POST' });
    try { localStorage.removeItem('bag'); } catch { /* ignore */ }
    location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", setupUI);
