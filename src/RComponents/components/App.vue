<template>
  <web3-check>
    <template v-slot:error="props">
      <RErrorDepNetwork v-if="props.error.type === 'network'" />
      <RErrorNotAccounts
        @requestAccount="requestAccount"
        v-else-if="props.error.type === 'account'"
      />
      <RErrorNotWeb3 v-else />
    </template>
    <template slot="load">
      <ROverlayLoader />
    </template>
    <template>
      <slot v-if="isReadyRobonomics" />
      <ROverlayLoader v-else />
    </template>
  </web3-check>
</template>

<script>
import Vue from "vue";
import Web3Check from "vue-web3-check";
import { init as initRobonomics } from "../tools/robonomics";
import { init as initIpfs } from "../tools/ipfs";
import getConfig from "../config";

export default {
  data() {
    return {
      isReadyRobonomics: false
    };
  },
  created() {
    Web3Check.store.on("load", async state => {
      const config = getConfig();
      const robonomics = config.robonomics(state.networkId);

      Vue.prototype.$ipfs = await initIpfs(config.ipfs);
      this.$ipfs.id((e, r) => {
        if (/go/i.test(r.agentVersion)) {
          this.$ipfs.swarm.connect("/dnsaddr/bootstrap.aira.life", console.log);
        }
      });

      Vue.prototype.$robonomics = initRobonomics(
        {
          account: {
            address: state.account
          },
          ens: {
            address: robonomics.ens,
            suffix: robonomics.ensSuffix,
            version: robonomics.version
          },
          lighthouse: robonomics.lighthouse
        },
        state.web3,
        this.$ipfs
      );

      // state.web3.currentProvider.setMaxListeners(300); // or more :)

      await this.$robonomics.ready();
      this.isReadyRobonomics = true;
    });
  },
  methods: {
    requestAccount() {
      Web3Check.access();
    }
  }
};
</script>
