const store = {
  cart: new Map(),
};

const observers = new Set();

const notify = () => {
  for (const observer of observers) {
    try {
      observer(store);
    } catch (error) {
      console.error(error);
    }
  }
};

export const subcribe = (...callbacks) => {
  callbacks.forEach((cb) => observers.add(cb));

  return () => {
    callbacks.forEach((cb) => observers.delete(cb));
  };
};

export const addCart = (product) => {
  const qty = store.cart.get(product.id) ?? 0;

  store.cart.set(product.id, qty + 1);

  notify();
};

export const setCart = (cart = []) => {
  store.cart = new Map(cart);

  notify();
};

export const removeCart = (productId, all = false) => {
  const qty = store.cart.get(productId);

  if (qty == null) return;

  if (all || qty <= 1) {
    store.cart.delete(productId);
  } else {
    store.cart.set(productId, qty - 1);
  }

  notify();
};

export const getQuantity = (id) => store.cart.get(id) ?? 0;

export const getTotalQuantity = () => {
  let total = 0;

  for (const qty of store.cart.values()) {
    total += qty;
  }

  return total;
};

export default store;
