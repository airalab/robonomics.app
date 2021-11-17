<template>
  <div class="techstatus" :class="{ on: isReady && account }" title="Ethereum">
    <div class="techstatus-logo">
      <IconEth />
    </div>
    <div class="techstatus-actions">
      <template
        v-if="
          isReady && (error === null || error.code === 2 || error.code === 3)
        "
      >
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
      <template v-if="error && error.code === 1">
        <div class="tip">Please, switch to Mainnet</div>
      </template>
      <template v-if="error && error.code === 4">
        <a href="https://metamask.io" target="_blank">Metamask</a> not found
      </template>
    </div>
  </div>
</template>

<script>
import IconCopy from "./IconCopy";
import IconEth from "./IconEth";

export default {
  components: { IconCopy, IconEth },
  computed: {
    isReady: function () {
      return this.$web3.isReady();
    },
    error: function () {
      return this.$web3.error();
    },
    account: function () {
      return this.$web3.account();
    },
    networkId: function () {
      return this.$web3.networkId();
    },
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
      await this.$web3.initAccount();
    }
  }
};
</script>
