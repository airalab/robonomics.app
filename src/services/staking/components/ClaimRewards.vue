<template>
  <button
    v-if="Number(value) > 0"
    class="btn-outline"
    @click="claimRewards"
    :disabled="process"
  >
    <span v-if="process" class="loader-ring"></span> Claim
  </button>
  <button v-else class="btn-outline">Claim</button>
</template>

<script>
import { Robonomics } from "../../../utils/robonomics-substrate";
import config from "../config";

export default {
  props: ["controller", "value"],
  data() {
    return {
      robonomics: null,
      process: false
    };
  },
  async created() {
    this.robonomics = Robonomics.getInstance(config.CHAIN);
  },
  methods: {
    async claimRewards() {
      this.process = true;
      try {
        await this.robonomics.accountManager.selectAccountByAddress(
          this.controller
        );
        const tx = this.robonomics.staking.claimRewards();
        const result = await this.robonomics.accountManager.signAndSend(tx);
        this.$emit("result", result);
      } catch (error) {
        console.log(error);
        this.$emit("error", error.message);
      }
      this.process = false;
    }
  }
};
</script>

<style scoped>
.mt15 {
  margin-top: 15px;
}
</style>
