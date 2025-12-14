/*********************************
 * CONFIG
 *********************************/
const STRIPE_PUBLIC_KEY = "pk_live_xxxxxxxxx";
const stripe = Stripe(STRIPE_PUBLIC_KEY);

/*********************************
 * LOAD CART
 *********************************/
const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
if (!cart.length) location.href = "cart.html";

/*********************************
 * PLACE ORDER BUTTON
 *********************************/
document.getElementById("placeOrder").addEventListener("click", async () => {
  const paymentMethod = document.querySelector("input[name='pay']:checked").value;

  const payload = {
    cart,
    customer: collectCustomer(),
    shippingMethod: document.getElementById("shippingMethod").value,
    currency: "USD"
  };

  if (paymentMethod === "card") {
    startStripeCheckout(payload);
  } else {
    startPayPalCheckout(payload);
  }
});

/*********************************
 * STRIPE CHECKOUT
 *********************************/
async function startStripeCheckout(payload) {
  const res = await fetch("/api/stripe/create-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const session = await res.json();
  stripe.redirectToCheckout({ sessionId: session.id });
}

/*********************************
 * PAYPAL CHECKOUT
 *********************************/
function startPayPalCheckout(payload) {
  fetch("/api/paypal/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => window.location.href = data.approvalUrl);
}

/*********************************
 * CUSTOMER DATA
 *********************************/
function collectCustomer() {
  return {
    name: fullName.value,
    email: email.value,
    phone: phone.value,
    address: address.value,
    city: city.value,
    state: state.value,
    zip: zip.value
  };
    }
