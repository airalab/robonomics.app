import { converterPpmToMgm3 } from "./tools";

export default {
  label: "NH3",
  name: {
    en: "Ammonia",
    ru: "Аммиак"
  },
  nameshort: {
    en: "Ammonia",
    ru: "Аммиак"
  },
  unit: "mg/m3",
  icon: "vial-virus",
  chartColor: "#a1e37a",
  colors: ["#60bc2a", "#ff9d00", "#fc0202"],
  range: [0, 15, 40],
  zones: [
    {
      value: 15,
      color: "#60bc2a",
      label: {
        en: "Good",
        ru: "Хорошо"
      }
    },
    {
      value: 40,
      color: "#ff9d00",
      label: {
        en: "Satisfyingly",
        ru: "Удовлетворительно"
      }
    },
    {
      color: "#fc0202",
      label: {
        en: "Poor",
        ru: "Плохо"
      }
    },
  ],
  calculate: function (v) {
    return converterPpmToMgm3(v, 17.03);
  },
};
