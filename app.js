const products = [
  {
    id: 1,
    name: "Waffle with Berries",
    description: "Waffle",
    price: 6.5,
    image: {
      thumbnail: "image-waffle-thumbnail.jpg",
    },
  },
  {
    id: 2,
    name: "Vanilla Bean Crème Brûlée",
    description: "Crème Brûlée",
    price: 7.0,
    image: {
      thumbnail: "image-creme-brulee-thumbnail.jpg",
    },
  },
  {
    id: 3,
    name: "Macaron Mix of Five",
    description: "Macaron",
    price: 8.0,
    image: {
      thumbnail: "image-macaron-thumbnail.jpg",
    },
  },
  {
    id: 4,
    name: "Classic Tiramisu",
    description: "Tiramisu",
    price: 5.5,
    image: {
      thumbnail: "image-tiramisu-thumbnail.jpg",
    },
  },
  {
    id: 5,
    name: "Pistachio Baklava",
    description: "Baklava",
    price: 4.0,
    image: {
      thumbnail: "image-baklava-thumbnail.jpg",
    },
  },
  {
    id: 6,
    name: "Lemon Meringue Pie",
    description: "Pie",
    price: 5.0,
    image: {
      thumbnail: "image-meringue-thumbnail.jpg",
    },
  },
  {
    id: 7,
    name: "Red Velvet Cake",
    description: "Cake",
    price: 4.5,
    image: {
      thumbnail: "image-cake-thumbnail.jpg",
    },
  },
  {
    id: 8,
    name: "Salted Caramel Brownie",
    description: "Brownie",
    price: 4.5,
    image: {
      thumbnail: "image-brownie-thumbnail.jpg",
    },
  },
  {
    id: 9,
    name: "Vanilla Panna Cotta",
    description: "Panna Cotta",
    price: 6.5,
    image: {
      thumbnail: "image-panna-cotta-thumbnail.jpg",
    },
  },
];

const productsById = new Map(products.map((p) => [p.id, p]));

const shoppingCartEl = document.getElementById("shopping-cart");
const modalEl = document.getElementById("modal");

const STORAGE_KEY = "shopping-cart";

const REMOVE_ITEM_ICON =
  '<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>';

const store = {
  cart: new Map(),
};

const update = () => {
  localStorageShoppingCart();
  renderShoppingCart();
  renderProductQuantity();
};

const addCart = (product) => {
  const qty = store.cart.get(product.id) ?? 0;
  store.cart.set(product.id, qty + 1);
  update();
};

const setCart = (cart = []) => {
  store.cart = new Map(cart);
  update();
};

const removeCart = (productId, all = false) => {
  const qty = store.cart.get(productId);

  if (qty == null) return;

  if (all || qty <= 1) {
    store.cart.delete(productId);
  } else {
    store.cart.set(productId, qty - 1);
  }

  update();
};

const renderShoppingCart = () => {
  let totalQuantity = 0;
  for (const qty of store.cart.values()) {
    totalQuantity += qty;
  }

  shoppingCartEl.replaceChildren();

  const shoppingCartQuantity = createEl("h2", {
    textContent: `Your Cart (${totalQuantity})`,
    classList: ["cart__title"],
  });

  shoppingCartEl.append(shoppingCartQuantity);

  if (store.cart.size === 0) {
    shoppingCartEl.append(
      createEl(
        "div",
        { classList: ["cart__empty-cart__container"] },
        createEl("img", {
          classList: ["cart__empty-cart__image"],
          src: "./assets/images/illustration-empty-cart.svg",
          alt: "illustration empty cart",
        }),
        createEl("p", {
          classList: ["cart__empty-cart__label"],
          textContent: "Your added items will appear here",
        }),
      ),
    );
    return;
  }

  const listEl = createEl("ul", { classList: ["cart__list"] });

  let total = 0;
  for (const [productId, qty] of store.cart) {
    const product = productsById.get(productId);
    if (!product) continue;

    total += product.price * qty;

    listEl.appendChild(
      createEl(
        "li",
        { classList: ["cart-item"] },
        createEl("h3", {
          textContent: product.name,
          classList: ["cart-item__title"],
        }),
        createEl(
          "p",
          { classList: ["cart-item__details"] },
          createEl("b", {
            textContent: `${qty}x`,
            classList: ["cart-item__quantity"],
          }),
          createEl("small", { textContent: " @ " }),
          createEl("span", {
            textContent: `${product.price.toFixed(2).replace(".", ",")} € `,
            classList: ["cart-item__unit-price"],
          }),
          createEl("strong", {
            textContent: `${(product.price * qty).toFixed(2).replace(".", ",")} €`,
            classList: ["cart-item__total"],
          }),
        ),
        createEl("button", {
          dataset: { productId: product.id },
          classList: ["cart-item__remove-btn"],
          ariaLabel: `Remove ${product.name} from cart`,
          innerHTML: REMOVE_ITEM_ICON,
        }),
      ),
    );
  }

  const totalEl = createEl(
    "p",
    { classList: ["cart__summary"] },
    createEl("span", {
      textContent: "Order Total ",
      classList: ["cart__label"],
    }),
    createEl("big", {
      textContent: `${total.toFixed(2).replace(".", ",")} €`,
      classList: ["cart__total"],
    }),
  );

  const submitButtonEl = createEl("button", {
    classList: ["cart__submit"],
    textContent: "Confirm Order",
  });

  shoppingCartEl.append(listEl, totalEl, submitButtonEl);
};

const renderOrderConfirmed = () => {
  const listEl = createEl("ul", { classList: ["order-modal__list"] });

  removeOrderConfirmed();

  let total = 0;
  for (const [productId, qty] of store.cart) {
    const product = productsById.get(productId);
    if (!product) continue;

    total += product.price * qty;

    listEl.appendChild(
      createEl(
        "li",
        { classList: ["order-item"] },
        createEl("img", {
          src: `./assets/images/${product.image.thumbnail}`,
          alt: product.name,
          classList: ["order-item__image"],
        }),
        createEl("h3", {
          textContent: product.name,
          classList: ["order-item__title"],
        }),
        createEl(
          "p",
          { classList: ["order-item__details"] },
          createEl("b", {
            textContent: `${qty}x`,
            classList: ["order-item__quantity"],
          }),
          createEl("small", { textContent: " @ " }),
          createEl("span", {
            textContent: `${product.price.toFixed(2).replace(".", ",")} € `,
            classList: ["order-item__unit-price"],
          }),
        ),
        createEl("strong", {
          textContent: `${(product.price * qty).toFixed(2).replace(".", ",")} €`,
          classList: ["order-item__total"],
        }),
      ),
    );
  }

  modalEl.appendChild(
    createEl(
      "div",
      { classList: ["order-modal__container"] },
      createEl(
        "div",
        { classList: ["order-modal__content"] },
        createEl("img", {
          src: "./assets/images/icon-order-confirmed.svg",
          alt: "icon order confirmed",
          classList: ["order-modal__icon"],
        }),
        createEl("h2", {
          textContent: "Order Confirmed",
          classList: ["order-modal__title"],
        }),
        createEl("p", {
          textContent: "We hope you enjoy your food!",
          classList: ["order-modal__subtitle"],
        }),
        listEl,
        createEl(
          "p",
          { classList: ["order-modal__summary"] },
          createEl("span", {
            textContent: "Order Total ",
            classList: ["order-modal__label"],
          }),
          createEl("big", {
            textContent: `${total.toFixed(2).replace(".", ",")} €`,
            classList: ["order-modal__total"],
          }),
        ),
        createEl("button", {
          textContent: "Start New Order",
          classList: ["order-modal__button"],
        }),
      ),
    ),
  );

  modalEl.classList.add("order-modal--open");
  document.body.classList.add("body--overflow-h");
};

const removeOrderConfirmed = () => {
  modalEl.replaceChildren();
  modalEl.classList.remove("order-modal--open");
  document.body.classList.remove("body--overflow-h");
};

const localStorageShoppingCart = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...store.cart.entries()]));
};

const renderProductQuantity = () => {
  document.querySelectorAll(`[data-product-quantity]`).forEach((el) => {
    const id = Number(el.dataset.productQuantity);
    const qty = store.cart.get(id) ?? 0;
    el.textContent = qty;

    const productCard = el.closest(".product-card");
    if (!productCard) return;

    if (qty > 0) {
      productCard.classList.add("product-card--selected");
    } else {
      productCard.classList.remove("product-card--selected");
    }
  });
};

const createEl = (tag, props = {}, ...children) => {
  const el = document.createElement(tag);

  if (props) {
    const { dataset, classList, ...rest } = props;

    Object.assign(el, rest);

    dataset && Object.assign(el.dataset, dataset);
    classList && el.classList.add(...classList);
  }

  el.append(...children);

  return el;
};

try {
  const cart = localStorage.getItem(STORAGE_KEY);
  if (cart) {
    setCart(JSON.parse(cart));
  }
} catch (error) {
  console.error("shopping cart error :", error);
}

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
    renderOrderConfirmed();
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

  if (!handler) return;

  handler({ button, productId: Number(button.dataset.productId) });
});
