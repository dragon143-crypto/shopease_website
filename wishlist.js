// wishlist.js
const W_KEY = "shopease_wishlist_v1";

const Wishlist = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(W_KEY) || "[]");
    } catch (e) {
      return [];
    }
  },

  save(list) {
    localStorage.setItem(W_KEY, JSON.stringify(list));
    Wishlist.updateUi();
  },

  toggle(product) {
    const list = Wishlist.get();
    const exists = list.find(i => i.id === product.id);
    if (exists) {
      const filtered = list.filter(i => i.id !== product.id);
      Wishlist.save(filtered);
      return false;
    } else {
      list.push({ id: product.id, title: product.title, img: product.images && product.images[0] });
      Wishlist.save(list);
      return true;
    }
  },

  isWish(productId) {
    return !!Wishlist.get().find(i => +i.id === +productId);
  },

  updateUi() {
    document.querySelectorAll(".wishlist-badge").forEach(el => {
      const len = Wishlist.get().length;
      el.textContent = len ? len : "";
    });
  }
};

document.addEventListener("DOMContentLoaded", () => Wishlist.updateUi());
