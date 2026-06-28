const shoppingCartEl = document.getElementById("shopping-cart");
const modalEl = document.getElementById("modal");
const productListEl = document.getElementById("product-list");

const REMOVE_ITEM_ICON =
  '<svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>';

const DECREASE_QUANTITY_ICON =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"></path></svg>';

const INCREASE_QUANTITY_ICON =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"></path></svg>';

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

export const renderProductList = ({ products }) => {
  const productListDocumentFragment = document.createDocumentFragment();

  for (const product of products) {
    productListDocumentFragment.appendChild(
      createEl(
        "li",
        { classList: ["product-card"] },
        createEl(
          "picture",
          { classList: ["product-card__picture"] },
          createEl("source", {
            media: "(min-width: 1024px)",
            srcset: `./assets/images/${product.image.desktop}`,
          }),
          createEl("source", {
            media: "(min-width: 848px)",
            srcset: `./assets/images/${product.image.tablet}`,
          }),
          createEl("img", {
            classList: ["product-card__image"],
            src: `./assets/images/${product.image.mobile}`,
            alt: product.name,
          }),
        ),
        createEl(
          "div",
          { classList: ["product-card__content"] },
          createEl("p", {
            classList: ["product-card__category"],
            textContent: product.category,
          }),
          createEl("h3", {
            classList: ["product-card__title"],
            textContent: product.name,
          }),
          createEl("b", {
            classList: ["product-card__price"],
            textContent: `${product.price.toFixed(2).replace(".", ",")} €`,
          }),
        ),
        createEl(
          "div",
          { classList: ["product-card__actions"] },
          createEl(
            "button",
            {
              type: "button",
              dataset: { productId: product.id },
              classList: ["product-card__add-btn"],
            },
            createEl("img", {
              src: "./assets/images/icon-add-to-cart.svg",
              alt: "Add to Cart",
            }),
            " Add to Cart",
          ),
          createEl(
            "div",
            { classList: ["product-card__quantity-selector"] },
            createEl("button", {
              type: "button",
              ariaLabel: "Decrease quantity",
              dataset: { productId: product.id },
              classList: [
                "product-card__quantity-btn",
                "product-card__quantity-btn--decrease",
              ],
              innerHTML: DECREASE_QUANTITY_ICON,
            }),
            createEl("span", {
              classList: ["product-card__quantity"],
              dataset: { productQuantity: product.id },
              textContent: "0",
            }),
            createEl("button", {
              type: "button",
              ariaLabel: "Decrease quantity",
              dataset: { productId: product.id },
              classList: [
                "product-card__quantity-btn",
                "product-card__quantity-btn--increase",
              ],
              innerHTML: INCREASE_QUANTITY_ICON,
            }),
          ),
        ),
      ),
    );
  }

  productListEl.replaceChildren(productListDocumentFragment);
};

export const renderProductQuantity = ({ cart }) => {
  document.querySelectorAll(`[data-product-quantity]`).forEach((el) => {
    const id = Number(el.dataset.productQuantity);
    const qty = cart.get(id) ?? 0;
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

export const renderShoppingCart = ({ productsById, cart }) => {
  let totalQuantity = 0;
  for (const [_, qty] of cart) {
    totalQuantity += qty;
  }

  shoppingCartEl.replaceChildren();

  const shoppingCartQuantity = createEl("h2", {
    textContent: `Your Cart (${totalQuantity})`,
    classList: ["cart__title"],
  });

  shoppingCartEl.append(shoppingCartQuantity);

  if (cart.size === 0) {
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
  for (const [productId, qty] of cart) {
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

export const renderOrderConfirmed = ({ productsById, cart }) => {
  const listEl = createEl("ul", { classList: ["order-modal__list"] });

  removeOrderConfirmed();

  let total = 0;
  for (const [productId, qty] of cart) {
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

export const removeOrderConfirmed = () => {
  modalEl.replaceChildren();
  modalEl.classList.remove("order-modal--open");
  document.body.classList.remove("body--overflow-h");
};
