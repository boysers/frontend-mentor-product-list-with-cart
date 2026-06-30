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

export const subscribe = (selector, listener) => {
  let previous = selector(store);

  const observer = (state) => {
    const current = selector(state);

    if (Object.is(previous, current)) {
      return;
    }

    previous = current;
    listener(current);
  };

  observers.add(observer);

  return () => observers.delete(observer);
};

export const addCart = (product) => {
  const cart = new Map(store.cart);

  const qty = cart.get(product.id) ?? 0;

  cart.set(product.id, qty + 1);

  store.cart = cart;

  notify();
};

export const setCart = (cart = []) => {
  store.cart = new Map(cart);

  notify();
};

export const removeCart = (productId, all = false) => {
  const cart = new Map(store.cart);

  const qty = cart.get(productId);

  if (qty == null) return;

  if (all || qty <= 1) {
    cart.delete(productId);
  } else {
    cart.set(productId, qty - 1);
  }

  store.cart = cart;

  notify();
};

export const getCart = () => new Map(store.cart);

export const getQuantity = (cart, id) => cart.get(id) ?? 0;

export const getTotalQuantity = (cart) => {
  let total = 0;

  for (const qty of cart.values()) {
    total += qty;
  }

  return total;
};

export const getCartTotal = (cart, productsById) => {
  let total = 0;

  for (const [productId, qty] of cart) {
    const product = productsById.get(productId);
    if (!product) continue;

    total += product.price * qty;
  }

  return total;
};
