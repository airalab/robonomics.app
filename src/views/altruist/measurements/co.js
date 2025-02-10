import { converterPpmToMgm3 } from "./tools";

export default {
  label: "CO",
  name: {
    en: "Carbon monoxide",
    ru: "Угарный газ"
  },
  unit: "mg/m3",
  chartColor: "#c1c1c1",
  colors: ["#60bc2a", "#ff9d00", "#fc0202"],
  range: [0, 2, 4, 14],
  zones: [
    {
      value: 0,
      color: "#60bc2a",
      label: {
        en: "Good",
        ru: "Хорошо"
      }
    },
    {
      value: 2,
      color: "#12bfcc",
      label: {
        en: "Satisfyingly",
        ru: "Удовлетворительно"
      }
    },
    {
      value: 4,
      color: "#ff9d00",
      label: {
        en: "Poor",
        ru: "Плохо"
      }
    },
    {
      color: "#7a00da",
      label: {
        en: "Very poor",
        ru: "Очень плохо"
      }
    },
  ],
  calculate: function (v) {
    return converterPpmToMgm3(v, 28.01);
  },
  info: "Сarbon monoxide. It is formed during the incomplete decomposition of organic compounds and during the combustion of biomass during forest fires.",
};
