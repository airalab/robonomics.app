<template>
  <RSidebar>
    <template v-slot:icon>
      <router-link to="/">
        <RIcon light="assets/i/logo-dapp.svg" dark="assets/i/logo-dapp.svg" />
      </router-link>
    </template>
    <RItem icon="i-menu">
      <RNavigation>
        <RNavigationLink :to="{ name: 'status' }" icon="i-piechart">{{ $t("menu.net_stats") }}</RNavigationLink>
        <RNavigationLink
          :to="{ name: 'lighthouseSelect' }"
          icon="i-lighthouse"
        >{{ $t("menu.lighthouse") }}</RNavigationLink>
        <RNavigationLink
          v-if="networkId == 1"
          :to="{ name: 'ambix' }"
          icon="i-transfer"
        >{{ $t("menu.tokens_alembic") }}</RNavigationLink>
        <RNavigationLink :to="{ name: 'services' }" icon="i-app">{{ $t("menu.services") }}</RNavigationLink>
        <RNavigationLink :to="{ name: 'uniswap' }" icon="i-day">{{ $t("menu.uniswap") }}</RNavigationLink>
      </RNavigation>
    </RItem>
    <RItem bottom icon="i-user">
      <RWallet :account="account" :networkId="networkId" :tokens="balances" />
    </RItem>
    <RItem bottom icon="i-info">
      <section>
        <nav class="nav-vertical">
          <a href="https://github.com/airalab" target="_blank">
            <span class="i-github align-vertical"></span>
            <span class="align-vertical">Github</span>
          </a>
          <a href="https://www.reddit.com/r/robonomics/" target="_blank">
            <span class="i-reddit align-vertical"></span>
            <span class="align-vertical">Reddit</span>
          </a>
          <a href="https://robonomics.network/" target="_blank">
            <span class="i-cursor align-vertical"></span>
            <span class="align-vertical">robonomics.network</span>
          </a>
          <a href="https://aira.life/" target="_blank">
            <span class="i-cursor align-vertical"></span>
            <span class="align-vertical">aira.life</span>
          </a>
        </nav>
      </section>
    </RItem>
  </RSidebar>
</template>

<script>
import { mapGetters } from "vuex";
import Web3Check from "vue-web3-check";
import config from "~config";

export default {
  data() {
    return {
      account: "0x0",
      networkId: 0
    };
  },
  computed: {
    ...mapGetters("tokens", ["balance", "token"]),
    balances() {
      const balances = [];
      Object.values(config.chain.get().TOKEN).forEach(item => {
        const info = this.token(item.address);
        const amount = this.$options.filters.fromWei(
          this.balance(item.address, this.$robonomics.account.address),
          info ? info.decimals : 0
        );
        balances.push({
          amount: amount,
          symbol: info ? info.symbol : ""
        });
      });
      return balances;
    }
  },
  created() {
    this.account = this.$robonomics.account.address;
    this.networkId = Web3Check.store.state.networkId;
    Object.values(config.chain.get().TOKEN).forEach(item => {
      this.$store.dispatch("tokens/add", item.address);
      this.$store.dispatch("tokens/watchBalance", {
        token: item.address,
        account: this.$robonomics.account.address
      });
    });
  }
};
</script>
