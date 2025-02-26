<template>
  <robo-layout-section>
    <robo-section offset="x2" width="narrow" style="text-align: center">
      <h2>Pay the robot with cryptocurrency.</h2>
      <br />
      <robo-text>
        Experience this unique demo of the future robot economy on the streets
        of Las Vegas during CES 2025! Pay one Robonomics token ($XRT) to a
        humanoid for any basic action.
      </robo-text>
      <br />
      <robo-text weight="bold" style="font-size: 40px">
        Price: 0.5<img src="./icon_XRT.png" class="logo" />
      </robo-text>
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

<style scoped>
.logo {
  width: 45px;
  vertical-align: text-top;
  margin: -2px 5px 0;
}
</style>
