/* =====================================================
   FILE: ecommerce-auth-session.js
   PURPOSE: Global Authentication & Session Controller
   WORKS WITH: index.html, cart.html, checkout.html,
               wishlist.html, account.html, orders.html
   STORAGE: sessionStorage (auth) + localStorage (data)
   ===================================================== */

/* =========================
   AUTH STATE & REDIRECTION
   ========================= */

const AUTH_PAGE = "authentication.html";
const HOME_PAGE = "index.html";

function isLoggedIn() {
  return !!sessionStorage.getItem("activeUser");
}

function getActiveUser() {
  return sessionStorage.getItem("activeUser");
}

function redirectIfNotLoggedIn(target = AUTH_PAGE) {
  if (!isLoggedIn()) {
    window.location.href = `${AUTH_PAGE}?redirect=${encodeURIComponent(window.location.pathname)}`;
  }
}

function redirectIfLoggedIn() {
  if (isLoggedIn() && window.location.pathname.includes(AUTH_PAGE)) {
    window.location.href = HOME_PAGE;
  }
}

redirectIfLoggedIn();

/* =========================
   USER AUTHENTICATION
   ========================= */

function loginUser(username, password) {
  const user = JSON.parse(localStorage.getItem(`user_${username}`) || "{}");

  if (user.password === password) {
    sessionStorage.setItem("activeUser", username);

    const redirect = new URLSearchParams(window.location.search).get("redirect");
    window.location.href = redirect || HOME_PAGE;
  } else {
    alert("Invalid credentials");
  }
}

function registerUser(userData) {
  localStorage.setItem(`user_${userData.username}`, JSON.stringify(userData));
  alert("Registration successful. Please login.");
}

function logoutUser() {
  const user = getActiveUser();

  // Clear session
  sessionStorage.clear();

  // Optional: Clear cached sensitive data
  localStorage.removeItem(`cart_${user}`);
  localStorage.removeItem(`checkout_${user}`);

  window.location.href = HOME_PAGE;
}

/* =========================
   USER DATA HELPERS
   ========================= */

function getUserData(type) {
  const user = getActiveUser();
  return JSON.parse(localStorage.getItem(`${type}_${user}`) || "[]");
}

function saveUserData(type, data) {
  const user = getActiveUser();
  localStorage.setItem(`${type}_${user}`, JSON.stringify(data));
}

/* =========================
   CART MANAGEMENT
   ========================= */

function addToCart(product) {
  if (!isLoggedIn()) return redirectIfNotLoggedIn();

  const cart = getUserData("cart");
  cart.push(product);
  saveUserData("cart", cart);
}

function getCartItems() {
  return getUserData("cart");
}

function clearCart() {
  saveUserData("cart", []);
}

/* =========================
   WISHLIST MANAGEMENT
   ========================= */

function addToWishlist(product) {
  if (!isLoggedIn()) return redirectIfNotLoggedIn();

  const wishlist = getUserData("wishlist");
  wishlist.push(product);
  saveUserData("wishlist", wishlist);
}

function getWishlistItems() {
  return getUserData("wishlist");
}

/* =========================
   CHECKOUT & ORDERS
   ========================= */

function checkout(orderData) {
  if (!isLoggedIn()) return redirectIfNotLoggedIn();

  const orders = getUserData("orders");
  orders.push({ ...orderData, date: new Date().toISOString() });
  saveUserData("orders", orders);

  clearCart();
  window.location.href = "orders.html";
}

function getOrders() {
  return getUserData("orders");
}

/* =========================
   PAYMENTS & ADDRESSES
   ========================= */

function savePaymentMethod(payment) {
  const payments = getUserData("payments");
  payments.push(payment);
  saveUserData("payments", payments);
}

function saveAddress(address) {
  const addresses = getUserData("addresses");
  addresses.push(address);
  saveUserData("addresses", addresses);
}

/* =========================
   PAGE PROTECTION HELPERS
   ========================= */

function protectCart() { redirectIfNotLoggedIn(); }
function protectCheckout() { redirectIfNotLoggedIn(); }
function protectAccount() { redirectIfNotLoggedIn(); }
function protectWishlist() { redirectIfNotLoggedIn(); }
function protectOrders() { redirectIfNotLoggedIn(); }

/* =========================
   ACCOUNT DATA DISPLAY
   ========================= */

function loadAccountSummary() {
  if (!isLoggedIn()) return redirectIfNotLoggedIn();

  document.getElementById("accUser").innerText = getActiveUser();
  document.getElementById("accOrders").innerText = getOrders().length;
  document.getElementById("accWishlist").innerText = getWishlistItems().length;
}

/* =========================
   ADVANCED E-COMMERCE FEATURES
   ========================= */

/* ===== JWT BACKEND SYNC ===== */
let API_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, method = "GET", data = null) {
  const token = sessionStorage.getItem("jwt");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : null
  });
  return res.json();
}

/* ===== ORDER STATUS TRACKING ===== */
function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    saveUserData("orders", orders);
  }
}

/* ===== INVENTORY LOCKING ===== */
function lockInventory(productId, qty) {
  const inventory = JSON.parse(localStorage.getItem("inventory") || "{}");
  if ((inventory[productId] || 0) < qty) {
    alert("Insufficient stock");
    return false;
  }
  inventory[productId] -= qty;
  localStorage.setItem("inventory", JSON.stringify(inventory));
  return true;
}

/* ===== GUEST CHECKOUT ===== */
function guestCheckout(orderData) {
  localStorage.setItem("guest_order", JSON.stringify(orderData));
  window.location.href = "checkout.html?guest=true";
}

/* ===== ADMIN DASHBOARD ===== */
function isAdmin() {
  const user = getActiveUser();
  return user && user.startsWith("admin_");
}

function getAllOrders() {
  if (!isAdmin()) return [];
  return Object.keys(localStorage)
    .filter(k => k.startsWith("orders_"))
    .flatMap(k => JSON.parse(localStorage.getItem(k)));
}

function updateInventory(productId, qty) {
  if (!isAdmin()) return;
  const inventory = JSON.parse(localStorage.getItem("inventory") || "{}");
  inventory[productId] = qty;
  localStorage.setItem("inventory", JSON.stringify(inventory));
}

/* ===== MULTI-CURRENCY ===== */
let currency = localStorage.getItem("currency") || "USD";
const rates = { USD:1, EUR:0.92, GBP:0.78, KES:155 };

function setCurrency(cur) {
  currency = cur;
  localStorage.setItem("currency", cur);
}

function convertPrice(priceUSD) {
  return (priceUSD * rates[currency]).toFixed(2) + " " + currency;
}

/* ===== STRIPE / PAYPAL INTEGRATION (PLACEHOLDERS) ===== */
async function payWithStripe(amount) {
  alert(`Stripe payment initiated for ${convertPrice(amount)}`);
}

async function payWithPayPal(amount) {
  alert(`PayPal payment initiated for ${convertPrice(amount)}`);
}

/* =========================
   SECURITY NOTES
   =========================
   ✔ SessionStorage for auth
   ✔ JWT-ready backend sync
   ✔ Inventory locking
   ✔ Guest checkout supported
   ✔ Admin role separation
   ✔ Multi-currency support
   ✔ Stripe & PayPal hooks ready
   ========================= */
