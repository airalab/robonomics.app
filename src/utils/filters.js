import { number } from "./tools";

export function fromWei(amount, decimals, currency = "", fixed = 0) {
  let value = number.fromWei(amount, decimals);
  if (fixed > 0) {
    const index = value.indexOf(".");
    if (index >= 0) {
      value = value.substr(0, index + fixed + 1);
    }
  }
  return `${value}${currency ? " " : ""}${currency}`;
}

export const labelAddress = (text) => {
  return text.slice(0, 6) + "..." + text.slice(-4);
};
