<template>
  <div>
    <div v-if="ready" style="padding-top:20px">
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
import { getInstance, hexToString } from "../utils/substrate";
import { parseResult, loadScript } from "../utils/utils";

export default {
  props: ["lighthouse", "model", "agent", "substrateBlock", "substrateTx"],
  components: {
    Message
  },
  data() {
    return {
      ready: true,
      item: null
    };
  },
  mounted() {
    loadScript("https://platform.twitter.com/widgets.js");
    this.init();
  },
  methods: {
    async init() {
      const substrate = await getInstance();
      // console.log(substrate.query.system);
      // substrate.query.system.extrinsicData.at(
      //   "0xcda332716bd86f8a487fc882ed560ba555b6368b2baf3290f0b4492bbac022e9",
      //   r => {
      //     console.log(r);
      //   }
      // );
      substrate.query.system.events.at(this.substrateBlock, events => {
        // console.log(events);
        events.forEach(record => {
          const { event /*, phase*/ } = record;
          if (event.section === "robonomicsStorage") {
            const eventObj = {
              // link: `${blockNUmber}-${phase.asApplyExtrinsic.toString()}`,
              // hashEvent: event.hash.toString(),
              section: event.section,
              method: event.method,
              data: {}
            };

            Object.keys(event.data.typeDef).forEach(index => {
              eventObj.data[event.data.typeDef[index].type] = event.data[
                index
              ].toString();
            });
            // console.log(eventObj);
          }
        });
      });

      substrate.rpc.chain.getBlock(this.substrateBlock, block => {
        // get extrinsics
        block.block.extrinsics.forEach(item => {
          if (
            item.method.sectionName === "robonomicsStorage" &&
            item.method.methodName === "record" &&
            item.hash.toString() === this.substrateTx
          ) {
            const obj = {
              tx: item.hash.toString(),
              props: {}
            };
            Object.keys(item.method.argsDef).forEach((prop, index) => {
              obj.props[prop] = item.method.args[index].toString();
            });
            const resultHash = hexToString(obj.props.record);
            this.item = {
              status: 2,
              resultHash: resultHash,
              substrateBlockHash: this.substrateBlock,
              substrateTxHash: this.substrateTx
            };
            parseResult(resultHash).then(result => {
              this.item = {
                ...this.item,
                status: 3,
                result: result
              };
            });
          }
        });
      });
    }
  }
};
</script>
