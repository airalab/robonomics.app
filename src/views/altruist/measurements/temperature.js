import { toFixed } from "./tools";

export default {
  label: "Tmp",
  name: {
    en: "Temperature",
    ru: "Температура"
  },
  nameshort: {
    en: "Temperature",
    ru: "Температура"
  },
  unit: "℃",
  chartColor: "#2d7ac7",
  colors: ["#fc0202", "#ff9d00", "#60bc2a", "#ff9d00", "#fc0202"],
  range: [-10, 0, 10, 25],
  zones: [
    {
      value: -9,
      color: "#7a00da",
      label: {
        en: "Very cold",
        ru: "Очень холодно"
      }
    },
    {
      value: 0,
      color: "#2a5cbc",
      label: {
        en: "Cold",
        ru: "Холодно"
      }
    },
    {
      value: 10,
      color: "#03a5ed",
      label: {
        en: "Cool",
        ru: "Прохладно"
      }
    },
    {
      value: 25,
      color: "#60bc2a",
      label: {
        en: "Warm",
        ru: "Тепло"
      }
    },
    {
      color: "#ff9d00",
      label: {
        en: "Hot",
        ru: "Жарко"
      }
    },
  ],
  states: ["danger", "attention", "good", "attention", "danger", "neutral"],
  calculate: function (v) {
    return toFixed(v);
  },
  info: "Показатель температуры воздуха",
};
