import { fromUnit } from "./tools";
export default {
  install: (app) => {
    app.config.globalProperties.$filters = {
      balance(value, decimals, symbol) {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "bigint"
        ) {
          return `${fromUnit(value, decimals, 4)} ${symbol}`;
        }
        return "";
      }
    };
  }
};
