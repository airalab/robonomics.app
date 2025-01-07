<template>
  <robo-layout-section>
    <robo-section offset="x2" width="narrow">
      <h3>The-Rise-of-Humanoids</h3>
    </robo-section>

    <template v-if="RobonomicsProvider.isReady">
      <robonomics-launch />
    </template>
    <template v-else>...</template>
  </robo-layout-section>
</template>

<script setup>
import { inject } from "vue";
import RobonomicsLaunch from "./RobonomicsLaunch.vue";

const RobonomicsProvider = inject("RobonomicsProvider");
</script>
