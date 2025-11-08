// ================================
// CART.JS - UNIVERSAL CART HANDLER
// ================================

// Load cart from localStorage or initialize empty
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ================================
// FUNCTION: Add item to cart
// ================================
function addToCart(productName, price = 0, image = "default.jpg") {
  const existingItem = cart.find(item => item.name === productName);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name: productName, price, image, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert(`${productName} added to cart!`);
}

// ================================
// FUNCTION: Render cart on cart.html
// ================================
function renderCart() {
  const cartContainer = document.getElementById("cart-items");

  if (!cartContainer) return; // Only run if we're on cart.html

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="text-gray-600 text-center">Your cart is empty.</p>`;
    return;
  }

  cart.forEach((item, index) => {
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
      <div class="flex items-center justify-between border-b py-3">
        <div class="flex items-center gap-3">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
          <div>
            <h4 class="font-semibold">${item.name}</h4>
            <p class="text-sm text-gray-500">Ksh ${item.price.toLocaleString()}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-2 bg-gray-200 rounded" onclick="updateQuantity(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="px-2 bg-gray-200 rounded" onclick="updateQuantity(${index}, 1)">+</button>
          <button class="text-red-500 ml-3" onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    `;
    cartContainer.appendChild(cartItem);
  });

  updateCartSummary();
}

// ================================
// FUNCTION: Update quantity
// ================================
function updateQuantity(index, change) {
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ================================
// FUNCTION: Remove item
// ================================
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ================================
// FUNCTION: Update cart summary
// ================================
function updateCartSummary() {
  const totalElement = document.getElementById("cart-total");
  if (!totalElement) return;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalElement.textContent = `Ksh ${total.toLocaleString()}`;
}

// ================================
// EVENT: Load cart items when page loads
// ================================
document.addEventListener("DOMContentLoaded", renderCart);