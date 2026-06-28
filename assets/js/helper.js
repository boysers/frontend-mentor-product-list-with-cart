export const formatPrice = (price) => `${price.toFixed(2).replace(".", ",")} €`;

export const createEl = (tag, props = {}, ...children) => {
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
