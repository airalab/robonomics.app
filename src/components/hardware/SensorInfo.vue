<template>
  <section>
    <h3>Advanced information</h3>
    <div class="infoline flexline">
      <div class="infoline-title">Sensor id:</div>
      <div class="infoline-info">
        {{ sensor_id }}
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: ["sensor_id"]
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
