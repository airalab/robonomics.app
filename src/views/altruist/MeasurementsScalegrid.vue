<template>
  <section v-if="scales && scales.length > 0">
    <h3>Units of measurement</h3>
    <div class="scalegrid">
      <div v-for="item in scales" :key="item.label">
        <template v-if="item?.zones && (item.name || item.label)">
          <p>
            <b v-if="item.name">{{
              locale === "en" ? item.name.en : item.name.ru
            }}</b>
            <b v-else>{{ item.label }}</b>
            ({{ item.unit }})
          </p>
          <template v-for="zone in item.zones" :key="zone.color">
            <div
              class="scales-color"
              v-if="zone.color && zone.label"
              :style="`--color: ${zone.color}`"
            >
              <b>{{ locale === "en" ? zone.label.en : zone.label.ru }}</b>
              (<template v-if="zone.value">up to {{ zone.value }}</template>
              <template v-else>above</template>)
            </div>
          </template>
        </template>
      </div>
    </div>
  </section>
</template>

<script>
import measurements from "./measurements";

export default {
  props: ["log"],
  setup(props) {
    const scales = [];
    let units = [];
    for (const item of props.log) {
      for (const unit of item.data) {
        if (units.indexOf(unit.fullKey) === -1) {
          units.push(unit.fullKey);
          if (measurements[unit.fullKey]) {
            scales.push(measurements[unit.fullKey]);
          }
        }
      }
    }

    return {
      locale: "en",
      scales
    };
  }
};
</script>

<style scoped>
/* + scales */
.scalegrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--gap);
  font-size: 0.8em;
}
.scalegrid p {
  margin-bottom: calc(var(--gap) * 0.5);
}

.scales-color {
  position: relative;
  padding-left: calc(var(--gap) * 2);
}

.scales-color:before {
  content: "";
  display: block;
  position: absolute;
  background-color: var(--color);
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--gap);
}
/* - scales */
</style>
