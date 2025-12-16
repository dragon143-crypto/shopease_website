/* ============================================
   GLOBAL DATA STORE (LOCALSTORAGE SYSTEM)
   ============================================ */

const DB_KEY = "SHOP_EASE_DB";

/* ---------- DEFAULT STRUCTURE ---------- */
const defaultDB = {
  profile: {
    name: "Guest User",
    email: "guest@example.com",
    phone: "",
    bio: "",
    avatar: "",
    display: "",
    role: "Member",
    status: "Verified",
    lastLogin: new Date().toDateString(),
  },

  cart: [],
  wishlist: [],
  orders: [],
  activity: [],
  sessions: [
    { device: "Chrome • Windows", location: "India", last: new Date().toLocaleString() }
  ]
};

/* ---------- LOAD DB ---------- */
function loadDB() {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : defaultDB;
}

/* ---------- SAVE DB ---------- */
function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

/* ---------- ACTIVITY LOGGER ---------- */
function logActivity(event, meta = "") {
  const db = loadDB();
  db.activity.unshift({
    when: new Date().toLocaleString(),
    event,
    meta
  });
  saveDB(db);
}

/* ---------- PROFILE FUNCTIONS ---------- */
function updateProfile(data) {
  const db = loadDB();
  db.profile = { ...db.profile, ...data };
  saveDB(db);
  logActivity("Profile updated", data.email || "");
}

function getProfile() {
  return loadDB().profile;
}

/* ---------- CART FUNCTIONS ---------- */
function addToCart(item) {
  const db = loadDB();
  db.cart.push(item);
  saveDB(db);
  logActivity("Added to cart", item.title);
}

function removeFromCart(id) {
  const db = loadDB();
  db.cart = db.cart.filter(i => i.id !== id);
  saveDB(db);
  logActivity("Removed from cart", id);
}

function getCart() {
  return loadDB().cart;
}

/* ---------- WISHLIST FUNCTIONS ---------- */
function addWishlist(item) {
  const db = loadDB();
  db.wishlist.push(item);
  saveDB(db);
  logActivity("Added to wishlist", item.title);
}

function removeWishlist(id) {
  const db = loadDB();
  db.wishlist = db.wishlist.filter(i => i.id !== id);
  saveDB(db);
  logActivity("Removed from wishlist", id);
}

function getWishlist() {
  return loadDB().wishlist;
}

/* ---------- ORDER FUNCTIONS ---------- */
function placeOrder(order) {
  const db = loadDB();
  db.orders.push(order);
  db.cart = []; // clear cart
  saveDB(db);
  logActivity("Placed order", order.id);
}

function getOrders() {
  return loadDB().orders;
}

/* ---------- ACTIVITIES ---------- */
function clearActivity() {
  const db = loadDB();
  db.activity = [];
  saveDB(db);
}

function getActivity() {
  return loadDB().activity;
}

/* ---------- SESSIONS ---------- */
function revokeSession(index) {
  const db = loadDB();
  db.sessions.splice(index, 1);
  saveDB(db);
  logActivity("Session revoked");
}

function getSessions() {
  return loadDB().sessions;
}
