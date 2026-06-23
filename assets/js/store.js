const store = {
  cart: new Map(),
  observers: [],
};

const update = () => {
  store.observers.forEach((o) => o());
};

export const addCart = (product) => {
  const qty = store.cart.get(product.id) ?? 0;
  store.cart.set(product.id, qty + 1);
  update();
};

export const setCart = (cart = []) => {
  store.cart = new Map(cart);
  update();
};

export const removeCart = (productId, all = false) => {
  const qty = store.cart.get(productId);

  if (qty == null) return;

  if (all || qty <= 1) {
    store.cart.delete(productId);
  } else {
    store.cart.set(productId, qty - 1);
  }

  update();
};

export default store;
