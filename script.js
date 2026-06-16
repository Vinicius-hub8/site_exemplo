const PRODUCTS_PER_PAGE = 4;
const CART_STORAGE_KEY = 'cart';
 
const productList = document.getElementById('product-list');
const products = Array.from(productList.querySelectorAll('.product'));
const pagination = document.getElementById('pagination');
 
const cartToggle = document.getElementById('cart-toggle');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartClose = document.getElementById('cart-close');
const cartItemsEl = document.getElementById('cart-items');
const cartEmptyEl = document.getElementById('cart-empty');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const cartCheckout = document.getElementById('cart-checkout');
 
let currentPage = 1;
let cart = loadCart();
 
function formatPrice(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
}
 
function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        return [];
    }
}
 
function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}
 
function showPage(page) {
    const totalPages = Math.max(1, Math.ceil(products.length / PRODUCTS_PER_PAGE));
    currentPage = Math.min(Math.max(1, page), totalPages);
 
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
 
    products.forEach((product, index) => {
        product.hidden = index < start || index >= end;
    });
 
    renderPagination(totalPages);
}
 
function renderPagination(totalPages) {
    pagination.innerHTML = '';
    if (totalPages <= 1) return;
 
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = 'Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => showPage(currentPage - 1));
    pagination.appendChild(prevBtn);
 
    for (let page = 1; page <= totalPages; page++) {
        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.textContent = String(page);
        pageBtn.setAttribute('aria-current', String(page === currentPage));
        pageBtn.addEventListener('click', () => showPage(page));
        pagination.appendChild(pageBtn);
    }
 
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = 'Próxima';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => showPage(currentPage + 1));
    pagination.appendChild(nextBtn);
}
 
function addToCart(id, name, price) {
    const existing = cart.find((item) => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1 });
    }
    saveCart();
    renderCart();
    openCart();
}
 
function changeQty(id, delta) {
    const item = cart.find((item) => item.id === id);
    if (!item) return;
 
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter((cartItem) => cartItem.id !== id);
    }
    saveCart();
    renderCart();
}
 
function removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    saveCart();
    renderCart();
}
 
function renderCart() {
    cartItemsEl.innerHTML = '';
 
    const isEmpty = cart.length === 0;
    cartEmptyEl.hidden = !isEmpty;
    cartItemsEl.hidden = isEmpty;
 
    let total = 0;
    let totalItems = 0;
 
    cart.forEach((item) => {
        total += item.price * item.qty;
        totalItems += item.qty;
 
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div class="cart-item__info">
                <p class="cart-item__name">${item.name}</p>
                <p class="cart-item__price">${formatPrice(item.price)} cada</p>
            </div>
            <div class="cart-item__qty">
                <button type="button" data-action="decrease" aria-label="Diminuir quantidade">−</button>
                <span>${item.qty}</span>
                <button type="button" data-action="increase" aria-label="Aumentar quantidade">+</button>
            </div>
            <button type="button" class="cart-item__remove" data-action="remove">Remover</button>
        `;
 
        li.querySelector('[data-action="decrease"]').addEventListener('click', () => changeQty(item.id, -1));
        li.querySelector('[data-action="increase"]').addEventListener('click', () => changeQty(item.id, 1));
        li.querySelector('[data-action="remove"]').addEventListener('click', () => removeItem(item.id));
 
        cartItemsEl.appendChild(li);
    });
 
    cartTotalEl.textContent = formatPrice(total);
    cartCountEl.textContent = String(totalItems);
}
 
function openCart() {
    cartDrawer.hidden = false;
    cartOverlay.hidden = false;
}
 
function closeCart() {
    cartDrawer.hidden = true;
    cartOverlay.hidden = true;
}
 
productList.addEventListener('click', (event) => {
    const button = event.target.closest('.add-to-cart');
    if (!button) return;
 
    const article = button.closest('.product');
    const id = article.dataset.id;
    const name = article.dataset.name;
    const price = parseFloat(article.dataset.price);
 
    addToCart(id, name, price);
});
 
cartToggle.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
 
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !cartDrawer.hidden) {
        closeCart();
    }
});
 
cartCheckout.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }
    alert('Compra finalizada! Total: ' + cartTotalEl.textContent);
    cart = [];
    saveCart();
    renderCart();
    closeCart();
});
 
showPage(1);
renderCart();
 