<template>
  <div>
    <button class="btn-outline" @click="withdrawUnbonded">Withdraw</button>
  </div>
</template>

<script>
import { Robonomics } from "../../../utils/robonomics-substrate";
import config from "../config";

export default {
  props: ["controller"],
  data() {
    return {
      robonomics: null
    };
  },
  async created() {
    this.robonomics = Robonomics.getInstance(config.CHAIN);
  },
  methods: {
    async withdrawUnbonded() {
      try {
        await this.robonomics.accountManager.selectAccountByAddress(
          this.controller
        );
        const tx = this.robonomics.staking.withdrawUnbonded();
        const result = await this.robonomics.accountManager.signAndSend(tx);
        this.$emit("result", result);
      } catch (error) {
        this.$emit("error", error.message);
      }
    }
  }
};
</script>

<style scoped>
.mt15 {
  margin-top: 15px;
}
</style>
