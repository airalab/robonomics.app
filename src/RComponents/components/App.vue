<template>
  <fragment>
    <template v-if="error">
      <RErrorDepNetwork v-if="error==1" />
      <RErrorNotAccounts v-else-if="error==2" />
      <RErrorNotAccess @requestAccount="requestAccount" v-else-if="error==3" />
      <RErrorNotWeb3 v-else />
    </template>
    <template v-else-if="!isReady">
      <ROverlayLoader />
    </template>
    <template v-else>
      <slot v-if="isReadyRobonomics" />
      <ROverlayLoader v-else />
    </template>
  </fragment>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import { init as initRobonomics } from "../tools/robonomics";
import { init as initIpfs } from "../tools/ipfs";
import { statusPeers } from "../tools/utils";
import getConfig from "../config";
import config from "~config";

export default {
  data() {
    return {
      isReadyRobonomics: false
    };
  },
  computed: {
    ...mapState("chain", ["error", "isReady", "networkId", "account"])
  },
  watch: {
    account(account, old) {
      if (this.$robonomics && old === null && account) {
        this.isReadyRobonomics = false;
        this.$robonomics.initAccount({
          address: account
        });
        setTimeout(() => {
          this.isReadyRobonomics = true;
        }, 300);
      } else if (old !== null && account !== old) {
        window.location.reload(false);
      }
    },
    networkId(networkId, old) {
      if (old !== null && networkId !== old) {
        window.location.reload(false);
      }
    }
  },
  async created() {
    this.$store.dispatch("chain/init", config.chain.getListId()).then(() => {
      this.init(this.$store.state.chain);
    });
  },
  methods: {
    async init(state) {
      const config = getConfig();
      const robonomics = config.robonomics(state.networkId);

      Vue.prototype.$ipfs = await initIpfs(config.ipfs);
      this.$ipfs.id((e, r) => {
        if (/go/i.test(r.agentVersion)) {
          this.$ipfs.swarm.connect("/dnsaddr/bootstrap.aira.life", console.log);
        }
      });

      const account = state.account
        ? {
            address: state.account
          }
        : null;
      Vue.prototype.$robonomics = initRobonomics(
        {
          account: account,
          ens: {
            address: robonomics.ens,
            suffix: robonomics.ensSuffix,
            version: robonomics.version
          },
          lighthouse: robonomics.lighthouse
        },
        state.getWeb3(),
        this.$ipfs
      );

      // state.web3.currentProvider.setMaxListeners(300); // or more :)

      await this.$robonomics.ready();
      this.isReadyRobonomics = true;

      window.statusPeers = (timeout = 0) => {
        console.log("Peers search", config.statusPeers);
        statusPeers(this.$ipfs, this.$robonomics, config.statusPeers, timeout);
      };
    },
    requestAccount() {
      this.$store.dispatch("chain/accessAccount");
    }
  }
};
</script>
