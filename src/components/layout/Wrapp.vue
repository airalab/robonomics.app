<template>
  <fragment>
    <slot v-if="isReadyRobonomics" />
    <ROverlay logo="assets/i/logo-dapp-2.svg" v-else>
      <section>
        <div class="loader">
          <RLoader class="align-vertical m-r-15" />
          <b class="align-vertical t-style_uppercase">
            <span>Loading</span>
          </b>
        </div>
      </section>
    </ROverlay>
  </fragment>
</template>

<script>
import Vue from "vue";
import { init as initRobonomics } from "../../utils/robonomics";
import { init as initIpfs } from "../../utils/ipfs";
import { statusPeers, referral } from "../../utils/tools";
import getConfig from "../../config/robonomics";

export default {
  props: ["networkId", "account", "web3"],
  data() {
    return {
      isReadyRobonomics: false
    };
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
          referral();
        }, 300);
      } else if (old !== null && account !== old) {
        window.location.reload(false);
      }
    }
  },
  created() {
    this.init(getConfig());
  },
  methods: {
    async init(config) {
      const robonomics = config.robonomics(this.networkId);

      Vue.prototype.$ipfs = await initIpfs(config.ipfs);
      const info = await this.$ipfs.id();
      if (/go/i.test(info.agentVersion)) {
        this.$ipfs.swarm.connect("/dnsaddr/bootstrap.aira.life", console.log);
      }

      const account = this.account ? { address: this.account } : null;
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
        this.web3,
        this.$ipfs
      );

      // state.web3.currentProvider.setMaxListeners(300); // or more :)

      await this.$robonomics.ready();
      this.isReadyRobonomics = true;
      referral();

      window.statusPeers = (timeout = 0) => {
        console.log("Peers search", config.statusPeers);
        statusPeers(this.$ipfs, this.$robonomics, config.statusPeers, timeout);
      };
    }
  }
};
</script>
