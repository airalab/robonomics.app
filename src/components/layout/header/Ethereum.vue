<template>
  <div class="techstatus" :class="{ on: isReady }" title="Ethereum">
    <div class="techstatus-logo">
      <IconEth />
    </div>
    <div class="techstatus-actions">
      <template v-if="isReady || error === 2 || error === 3">
        <div class="tip">{{ network }}</div>
        <div v-if="account" class="flexline flexline-smallgap flexline-center">
          <span>{{ accountView }}</span>
          <a
            href="javascript:;"
            title="copy address"
            v-clipboard:copy="account"
          >
            <IconCopy />
          </a>
        </div>
        <a v-else href="" @click.stop.prevent="connect">Connect account</a>
      </template>
      <template v-if="error === 1">
        <div class="tip">Please, switch to Mainnet</div>
      </template>
      <template v-if="error === 4">
        <a href="https://metamask.io" target="_blank">Metamask</a> not found
      </template>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import IconCopy from "./IconCopy";
import IconEth from "./IconEth";

export default {
  components: { IconCopy, IconEth },
  computed: {
    ...mapState("chain", ["error", "isReady", "networkId", "account"]),
    accountView: function () {
      if (this.account) {
        return `${this.account.substr(0, 6)}...${this.account.substr(-6)}`;
      }
      return "";
    },
    network: function () {
      if (this.networkId === 1) {
        return `Mainnet`;
      }
      if (this.networkId === 4) {
        return `Rinkeby`;
      }
      return `Chain id ${this.networkId}`;
    }
  },
  methods: {
    async connect() {
      this.$store.dispatch("chain/accessAccount");
    }
  }
};
</script>
