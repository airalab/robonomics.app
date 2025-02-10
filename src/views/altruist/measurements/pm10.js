import { toFixed } from "./tools";

export default {
  label: "PM10",
  unit: "μg/m3",
  chartColor: "#e8b738",
  colors: ["#60bc2a", "#ff9d00", "#fc0202"],
  range: [0, 51, 101, 251, 350],
  zones: [
    {
      value: 50,
      color: "#60bc2a",
      label: {
        en: "Good",
        ru: "Хорошо"
      }
    },
    {
      value: 100,
      color: "#12bfcc",
      label: {
        en: "Satisfyingly",
        ru: "Удовлетворительно"
      }
    },
    {
      value: 250,
      color: "#ff9d00",
      label: {
        en: "Poor",
        ru: "Плохо"
      }
    },
    {
      value: 350,
      color: "#ff4d00",
      label: {
        en: "Very poor",
        ru: "Очень плохо"
      }
    },
    {
      color: "#7a00da",
      label: {
        en: "Unacceptable",
        ru: "Неприемлемо"
      }
    },
  ],
  calculate: function (v) {
    return toFixed(v);
  },
  info: "PM10 - suspended particles (PM - particulate matter) of a substance with a diameter of less than 10 micrometers (μm). Pollen and other allergens.",
};
