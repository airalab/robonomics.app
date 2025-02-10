import { toFixed } from "./tools";

export default {
  label: "PM2.5",
  unit: "μg/m3",
  chartColor: "#89b268",
  colors: ["#60bc2a", "#ff9d00", "#fc0202"],
  range: [0, 36, 70, 151, 251],
  zones: [
    {
      value: 36,
      color: "#60bc2a",
      label: {
        en: "Good",
        ru: "Хорошо"
      }
    },
    {
      value: 70,
      color: "#12bfcc",
      label: {
        en: "Satisfyingly",
        ru: "Удовлетворительно"
      }
    },
    {
      value: 150,
      color: "#ff9d00",
      label: {
        en: "Poor",
        ru: "Плохо"
      }
    },
    {
      value: 250,
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
  info: "Suspended, solid and liquid particles with a diameter of 2.5 microns are an air pollutant.",
};
