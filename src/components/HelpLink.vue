<template>
  <robo-section offset="x1" width="narrow" centered class="help-link">
    <robo-text size="small" align="center">
      <robo-icon icon="circle-question" />
      {{ text }}
      <a :href="url" target="_blank" rel="noopener">{{ label }} ↗</a>
    </robo-text>
  </robo-section>
</template>

<script setup>
import { computed } from "vue";

const WIKI = "https://wiki.robonomics.network/docs/";

const props = defineProps({
  // wiki page and optional anchor, e.g. "legacy-pallets#rws-subscriptions"
  page: { type: String, required: true },
  text: { type: String, default: "" },
  label: { type: String, default: "How this works" }
});

const url = computed(() => {
  const [page, anchor] = props.page.split("#");
  return `${WIKI}${page}/${anchor ? "#" + anchor : ""}`;
});
</script>

<style scoped>
.help-link {
  margin-top: calc(var(--robo-space) * 2);
}
</style>
