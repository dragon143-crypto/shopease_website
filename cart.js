// cart.js - simple cart system using localStorage
const CART_KEY = "shopease_cart_v1";

const Cart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (e) {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    UI.updateCartBadge();
  },

  add(product, qty = 1, selectedColor = null) {
    const items = Cart.get();
    const existing = items.find(i => i.id === product.id && i.color === selectedColor);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, 99);
    } else {
      items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        img: product.images && product.images[0],
        qty,
        color: selectedColor
      });
    }
    Cart.save(items);
  },

  remove(id, color = null) {
    let items = Cart.get();
    items = items.filter(i => !(i.id === id && i.color === color));
    Cart.save(items);
  },

  updateQty(id, color, qty) {
    const items = Cart.get();
    const it = items.find(i => i.id === id && i.color === color);
    if (it) {
      it.qty = Math.max(1, Math.min(qty, 99));
      Cart.save(items);
    }
  },

  clear() {
    localStorage.removeItem(CART_KEY);
    UI.updateCartBadge();
  },

  total() {
    return Cart.get().reduce((s,i) => s + (i.price * i.qty), 0);
  }
};

// Simple UI helpers (used by other files)
const UI = {
  updateCartBadge() {
    const el = document.querySelectorAll(".cart-badge");
    const count = Cart.get().reduce((s,i)=> s + i.qty, 0);
    el.forEach(x => x.textContent = count ? count : "");
  },

  renderCartTable(containerEl) {
    const items = Cart.get();
    if (!items.length) {
      containerEl.innerHTML = `<div class="empty">Your cart is empty.</div>`;
      return;
    }
    const lines = items.map(it => `
      <div class="cart-row" data-id="${it.id}" data-color="${it.color || ''}">
        <img src="${it.img || ''}" class="cart-thumb">
        <div class="cart-title">${it.title}${it.color ? ` <small>(${it.color})</small>` : ''}</div>
        <div class="cart-price">${formatPrice(it.price)}</div>
        <div class="cart-qty">
          <button class="qty-decr">−</button>
          <input class="qty-input" value="${it.qty}" />
          <button class="qty-incr">+</button>
        </div>
        <div class="cart-sub">${formatPrice(it.price * it.qty)}</div>
        <button class="cart-remove">Remove</button>
      </div>
    `).join("");
    containerEl.innerHTML = `
      <div class="cart-header">
        ${lines}
      </div>
      <div class="cart-footer">
        <div class="total">Total: ${formatPrice(Cart.total())}</div>
        <div><button id="checkoutBtn" class="btn primary">Checkout</button></div>
      </div>
    `;

    // wire up events
    containerEl.querySelectorAll(".cart-row").forEach(row => {
      const id = +row.dataset.id;
      const color = row.dataset.color || null;
      row.querySelector(".qty-incr").onclick = () => {
        const input = row.querySelector(".qty-input");
        const v = +input.value + 1;
        input.value = v;
        Cart.updateQty(id, color, v);
        UI.renderCartTable(containerEl);
      };
      row.querySelector(".qty-decr").onclick = () => {
        const input = row.querySelector(".qty-input");
        const v = Math.max(1, +input.value - 1);
        input.value = v;
        Cart.updateQty(id, color, v);
        UI.renderCartTable(containerEl);
      };
      row.querySelector(".qty-input").onchange = (e) => {
        let v = +e.target.value || 1;
        Cart.updateQty(id, color, v);
        UI.renderCartTable(containerEl);
      };
      row.querySelector(".cart-remove").onclick = () => {
        Cart.remove(id, color);
        UI.renderCartTable(containerEl);
      };
    });

    const checkoutBtn = containerEl.querySelector("#checkoutBtn");
    if (checkoutBtn) checkoutBtn.onclick = () => alert("Checkout demo — integrate real flow.");
  }
};

// helper used above (reused)
function formatPrice(n){ return "₹" + n.toLocaleString("en-IN"); }

// initial badge update
document.addEventListener("DOMContentLoaded", () => UI.updateCartBadge());

// ========== LOAD CART ITEMS ==========

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function loadCart() {
  const container = document.getElementById("cartItems");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `<h2>Your cart is empty 😕</h2>`;
    updateSummary();
    return;
  }

  cart.forEach((item, index) => {
    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="">
        
        <div class="item-details">
          <p class="item-title">${item.title}</p>
          <p class="price">₹${item.price}</p>

          <div class="qty-box">
            <span class="qty-btn" onclick="changeQty(${index}, -1)">−</span>
            <span class="qty-number">${item.qty}</span>
            <span class="qty-btn" onclick="changeQty(${index}, 1)">+</span>
          </div>
        </div>

        <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  updateSummary();
}


// ========== CHANGE QUANTITY ==========
function changeQty(index, change) {
  cart[index].qty += change;
  
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
}


// ========== REMOVE ITEM ==========
function removeItem(i) {
  cart.splice(i, 1);
  saveCart();
}


// ========== UPDATE SUMMARY ==========
function updateSummary() {
  let count = 0;
  let subtotal = 0;

  cart.forEach(item => {
    count += item.qty;
    subtotal += item.price * item.qty;
  });

  document.getElementById("summary-count").innerText = count;
  document.getElementById("summary-subtotal").innerText = subtotal;
  document.getElementById("summary-discount").innerText = "10%";

  const total = subtotal - subtotal * 0.10;
  document.getElementById("summary-total").innerText = total.toFixed(2);
}


// ========== SAVE CART ==========
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}


// Load on start
loadCart();

