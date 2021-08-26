<template>
  <RCard class="section-centered">
    <h1>Message</h1>
    <div class="item">
      <div class="loader-ring" v-if="!data"></div>
      <code class="data">{{ data }}</code>
    </div>
    <a :href="getLinkExplorer()" target="_blank"> view explorer </a>
  </RCard>
</template>

<script>
import { hexToString } from "@polkadot/util";
import config from "../../config";
import { Robonomics } from "@/utils/robonomics-substrate";

export default {
  props: ["sensor", "block", "tx"],
  data() {
    return {
      data: ""
    };
  },
  async mounted() {
    const robonomics = Robonomics.getInstance();
    robonomics.api.rpc.chain.getBlock(this.block, (block) => {
      block.block.extrinsics.forEach((item) => {
        if (
          item.method.section === "datalog" &&
          item.method.method === "record" &&
          item.hash.toString() === this.tx
        ) {
          const props = {};
          Object.keys(item.method.argsDef).forEach((prop, index) => {
            props[prop] = item.method.args[index].toString();
          });
          this.data = hexToString(props.record);
        }
      });
    });
  },
  methods: {
    getLinkExplorer() {
      return `${config.explorer}/#/explorer/query/${this.block}`;
    }
  }
};
</script>

<style scoped>
.item {
  border: 1px solid #eee;
}
.data {
  padding: 10px;
  font-size: 12px;
}
.share {
  margin: 5px;
}
</style>
