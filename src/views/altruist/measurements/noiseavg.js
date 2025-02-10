import { toFixed } from "./tools";

export default {
  label: "Noise Avg.",
  name: {
    en: "Noise Avg.",
    ru: "Шум Средн."
  },
  nameshort: {
    en: "Noise Avg.",
    ru: "Шум Средн."
  },
  unit: "dB",
  range: [0, 40, 70, 80, 100],
  zones: [
    {
      value: 40,
      color: "#60bc2a",
      label: {
        en: "Faint",
        ru: "Тихо"
      }
    },
    {
      value: 70,
      color: "#12bfcc",
      label: {
        en: "Moderate",
        ru: "Удовлетворительно"
      }
    },
    {
      value: 80,
      color: "#ff9d00",
      label: {
        en: "Loud",
        ru: "Шумно"
      }
    },
    {
      value: 100,
      color: "#ff4d00",
      label: {
        en: "Very loud",
        ru: "Очень шумно"
      }
    },
    {
      color: "#7a00da",
      label: {
        en: "Extremely loud",
        ru: "Экстремально шумно"
      }
    },
  ],
  calculate: function (v) {
    return toFixed(v);
  },
  info: "Noise is what your ears or noise sensor can sense. Measured in Decibel (dB).",
};
