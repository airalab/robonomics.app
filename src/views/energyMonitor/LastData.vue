<template>
  <section>
    <h3>Last data {{ new Date(data.moment).toLocaleString() }}</h3>
    <div class="infoline flexline">
      <div class="infoline-info">
        <div
          class="datalog-item"
          v-for="(item, key) in measurements"
          :key="key"
        >
          <b>{{ item.label }}:</b> {{ item.value }}
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { getMeasurementByName } from "./measurements/tools";

export default {
  props: ["data"],
  setup(props) {
    const measurements = [];
    for (const item of props.data.data) {
      const measurement = getMeasurementByName(item.fullKey);
      measurements.push({
        ...measurement,
        value: `${
          measurement.calculate ? measurement.calculate(item.value) : item.value
        } ${measurement.unit ?? ""}`
      });
    }
    return {
      measurements
    };
  }
};
</script>

<style scoped>
:root {
  --gap: 10px;
}

.flexline {
  display: flex;
  gap: calc(var(--gap) * 2);
  align-items: center;
}

.flexline .flexline {
  gap: var(--gap);
}
.infoline.flexline {
  gap: calc(var(--gap) * 0.5);
}
.infoline-title {
  font-weight: bold;
}
.infoline-info {
  font-size: 0.9rem;
}
</style>
