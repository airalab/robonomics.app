import { number } from "./tools";

export function fromWei(amount, decimals, currency = "") {
  return `${number.fromWei(amount, decimals)}${currency ? " " : ""}${currency}`;
}

export const labelAddress = text => {
  return text.slice(0, 6) + "..." + text.slice(-4);
};
