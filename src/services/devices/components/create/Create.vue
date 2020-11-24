<template>
  <RCard class="section-centered">
    <Step1 v-if="active === 1" @next="handleNext(1)" />
    <Step2
      v-if="active === 2"
      @prev="handlePrev(2)"
      @next="(data) => handleNext(2, data)"
    />
    <Step3
      v-if="active === 3"
      @prev="handlePrev(3)"
      @next="(data) => handleNext(3, data)"
      :name="name"
    />
    <Step4
      v-if="active === 4"
      @prev="handlePrev(4)"
      @next="handleNext(4)"
      :lang="lang"
      :name="name"
    />
    <Step5 v-if="active === 5" @prev="handlePrev(5)" @next="handleNext(5)" />
    <Step6 v-if="active === 6" @prev="handlePrev(6)" @next="handleNext(6)" />
    <!-- <Step7 v-if="active === 7" @prev="handlePrev(7)" @next="handleNext(7)" /> -->
  </RCard>
</template>

<script>
import Step1 from "./Step_1";
import Step2 from "./Step_2";
import Step3 from "./Step_3";
import Step4 from "./Step_4";
import Step5 from "./Step_5";
import Step6 from "./Step_6";
// import Step7 from "./Step_7";
import { storageDevices } from "../../utils/storage";

export default {
  components: {
    Step1,
    Step2,
    Step3,
    Step4,
    Step5,
    Step6
    // Step7
  },
  data() {
    return {
      active: 1,
      platform: "",
      lang: "",
      name: ""
    };
  },
  methods: {
    handlePrev(step) {
      this.active = step - 1;
    },
    handleNext(step, data) {
      this.active = step + 1;
      if (step === 2) {
        this.platform = data.platform;
        this.lang = data.lang;
      }
      if (step === 3) {
        this.name = data.name;
      }
      if (step === 5) {
        storageDevices.addItem(this.name, {
          platform: this.platform,
          lang: this.lang
        });
      }
      if (step === 6) {
        this.$router.push({ name: "iot-activity", params: { id: this.name } });
      }
    }
  }
};
</script>

<style>
.block-wiz {
  margin: 20px 0;
}
.nav-wiz {
  border-top: 1px solid #eee;
  margin-top: 20px;
  padding-top: 10px;
}
.nav-wiz button {
  margin-right: 20px;
}
</style>
