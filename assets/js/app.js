import {
  closeOrderModal,
  renderOrderConfirmed,
  renderProductQuantity,
  renderShoppingCart,
  renderProductList,
  announceCartUpdate,
  openOrderModal,
} from "./dom.js";
import {
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
subscribe((state) => getTotalQuantity(state.cart), announceCartUpdate);

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
  "decrease-quantity": ({ element, productId }) => {
    removeCart(productId);

    element
      .closest(".product-card__actions")
      ?.querySelector(".product-card__add-btn")
      ?.focus();
  },
  "add-to-cart": ({ element, productId }) => {
    addCart(productsById.get(productId));

    const actionsEl = element
      .closest(".product-card__actions")
      ?.querySelector(".product-card__quantity-btn--increase")
      ?.focus();
  },
  "remove-cart-item": ({ productId }) => {
    removeCart(productId, true);
  },
  "submit-cart": () => {
    const cart = getCart();

    renderOrderConfirmed({
      productsById,
      cart,
      total: getCartTotal(cart, productsById),
    });

    openOrderModal();

    setCart();
  },
  "close-order-modal": () => {
    closeOrderModal();
  },
};

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const actionName = el.dataset.action;
  const fn = actions[actionName];

  fn && fn({ element: el, productId: Number(el.dataset.productId) });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeOrderModal();
  }
});
