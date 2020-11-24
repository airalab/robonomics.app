<template>
  <div>
    <div v-if="ready" style="padding-top: 20px">
      <RWindow id="window-sensornetwork-requests">
        <template slot="header">
          <span>{{ $t("sensor.result") }}</span>
        </template>
        <RCard v-if="item">
          <Message
            :item="item"
            :lighthouse="lighthouse"
            :model="model"
            :agent="agent"
            :isSubstrate="true"
          />
        </RCard>
      </RWindow>
    </div>
  </div>
</template>

<script>
import Message from "./MessageFree";
import { parseResult, loadScript } from "../utils/utils";

export default {
  props: ["lighthouse", "model", "agent", "result"],
  components: {
    Message
  },
  data() {
    return {
      ready: false,
      item: null
    };
  },
  mounted() {
    loadScript("https://platform.twitter.com/widgets.js");

    if (this.$robonomics.messenger) {
      this.$robonomics.messenger.stop();
    }
    this.$robonomics.initLighthouse(this.lighthouse).then(() => {
      this.ready = true;

      this.item = {
        status: 2,
        resultHash: this.result
      };
      parseResult(this.result)
        .then((result) => {
          this.item = {
            ...this.item,
            status: 3,
            result: result
          };
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }
};
</script>
