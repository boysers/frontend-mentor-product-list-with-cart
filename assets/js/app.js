import {
  removeOrderConfirmed,
  renderOrderConfirmed,
  renderProductQuantity,
  renderShoppingCart,
  renderProductList,
} from "./dom.js";
import store, { addCart, subcribe, removeCart, setCart } from "./store.js";

const response = await fetch("./assets/json/data.json");

if (!response.ok) {
  throw new Error("fetch error");
}

const products = await response.json();
const productsById = new Map(products.map((p) => [p.id, p]));

const STORAGE_KEY = "shopping-cart";

const unsubscribe = subcribe(
  ({ cart }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...cart.entries()]));
  },
  ({ cart }) => renderShoppingCart({ cart, productsById }),
  renderProductQuantity,
);

// Rerender product list (desserts)
renderProductList({ products });

try {
  const cart = localStorage.getItem(STORAGE_KEY);
  cart && setCart(JSON.parse(cart));
} catch (error) {
  console.error("shopping cart error :", error);
}

// ########## Events ##########

const handlers = {
  "product-card__quantity-btn--increase": ({ productId }) => {
    addCart(productsById.get(productId));
  },
  "product-card__quantity-btn--decrease": ({ button, productId }) => {
    removeCart(productId);

    button
      .closest(".product-card__actions")
      ?.querySelector(".product-card__add-btn")
      ?.focus();
  },
  "product-card__add-btn": ({ button, productId }) => {
    addCart(productsById.get(productId));

    const actionsEl = button
      .closest(".product-card__actions")
      ?.querySelector(".product-card__quantity-btn--increase")
      ?.focus();
  },
  "cart-item__remove-btn": ({ productId }) => {
    removeCart(productId, true);
  },
  cart__submit: () => {
    renderOrderConfirmed({ productsById, cart: store.cart });
    document.querySelector(".order-modal__button")?.focus();
  },
  "order-modal__button": () => {
    removeOrderConfirmed();
    setCart();
    document.querySelector(".product-card__add-btn")?.focus();
  },
};

document.addEventListener("click", (e) => {
  const button = e.target.closest("button");

  if (!button) return;

  const handler = Object.entries(handlers).find(([className]) =>
    button.classList.contains(className),
  )?.[1];

  handler && handler({ button, productId: Number(button.dataset.productId) });
});
