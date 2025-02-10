import measurements from "./index";

export function toFixed(num, dec = 4) {
  return +(+num || 0).toFixed(dec);
}
export function converterPpmToMgm3(v, molecularWeight) {
  return toFixed((v * molecularWeight) / 24.05526);
}
export const states = ["good", "attention", "danger", "neutral"];
export function getMeasurementByName(name) {
  return measurements[name] || measurements["pm10"];
}
