import {
  removeOrderConfirmed,
  renderOrderConfirmed,
  renderProductQuantity,
  renderShoppingCart,
  renderProductList,
} from "./dom.js";
import store, {
  addCart,
  removeCart,
  setCart,
  subscribe,
  getQuantity,
  getTotalQuantity,
  getCart,
  getCartTotal,
} from "./store.js";

const response = await fetch("./assets/json/data.json");

if (!response.ok) {
  throw new Error("fetch error");
}

const products = await response.json();
const productsById = new Map(products.map((p) => [p.id, p]));

const STORAGE_KEY = "shopping-cart";

// Persist cart
subscribe(
  (state) => JSON.stringify([...state.cart.entries()]),
  (value) => localStorage.setItem(STORAGE_KEY, value),
);

// Render cart
subscribe(
  (state) => state.cart,
  (cart) =>
    renderShoppingCart({
      cart,
      productsById,
      totalQuantity: getTotalQuantity(cart),
      total: getCartTotal(cart, productsById),
    }),
);

// Render per-product quantity
for (const product of products) {
  subscribe(
    (state) => getQuantity(state.cart, product.id),
    (qty) => renderProductQuantity(product.id, qty),
  );
}

// Render product list (desserts)
renderProductList({ products });

// Hydrate cart from localStorage
try {
  const cart = localStorage.getItem(STORAGE_KEY);
  cart && setCart(JSON.parse(cart));
} catch (error) {
  console.error("shopping cart error :", error);
}

/* =========================
   EVENTS (data-action based)
========================= */

const actions = {
  "increase-quantity": ({ productId }) => {
    addCart(productsById.get(productId));
  },
  "decrease-quantity": ({ button, productId }) => {
    removeCart(productId);

    button
      .closest(".product-card__actions")
      ?.querySelector(".product-card__add-btn")
      ?.focus();
  },
  "add-to-cart": ({ button, productId }) => {
    addCart(productsById.get(productId));

    const actionsEl = button
      .closest(".product-card__actions")
      ?.querySelector(".product-card__quantity-btn--increase")
      ?.focus();
  },
  "remove-cart-item": ({ productId }) => {
    removeCart(productId, true);
  },
  "submit-cart": () => {
    const cart = getCart(store);

    renderOrderConfirmed({
      productsById,
      cart,
      total: getCartTotal(cart, productsById),
    });

    document.querySelector(".order-modal__button")?.focus();
  },
  "close-order-modal": () => {
    removeOrderConfirmed();
    setCart();
    document.querySelector(".product-card__add-btn")?.focus();
  },
};

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const actionName = el.dataset.action;
  const fn = actions[actionName];

  fn && fn({ button: el, productId: Number(el.dataset.productId) });
});
