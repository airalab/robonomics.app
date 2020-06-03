<template>
  <SidebarPanel>
    <template v-slot:icon>
      <router-link to="/">
        <Logo light="assets/i/logo-dapp.svg" dark="assets/i/logo-dapp.svg" />
      </router-link>
    </template>
    <Item icon="i-menu">
      <Navigation>
        <NavigationLink :to="{ name: 'overview' }" icon="i-cursor">
          {{ $t("menu.overview") }}
        </NavigationLink>
        <NavigationLink :to="{ name: 'telemetry' }" icon="i-piechart">
          {{ $t("menu.telemetry") }}
        </NavigationLink>
        <NavigationLink :to="{ name: 'services' }" icon="i-app">
          {{ $t("menu.services") }}
        </NavigationLink>
        <NavigationLink :to="{ name: 'lighthouseSelect' }" icon="i-lighthouse">
          {{ $t("menu.lighthouses") }}
        </NavigationLink>
        <a href="https://parachain.robonomics.network/" target="_blank">
          <span
            class="align-vertical"
            style="
              background: url('img/parachain-icon.png');
              width: 16px;
              height: 16px;
              display: inline-block;
            "
          ></span>
          &nbsp;
          <span class="align-vertical">{{ $t("menu.parachain") }}</span>
        </a>
        <a
          v-if="isBrave"
          href="https://uniswap.exchange/swap?outputCurrency=0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7"
          target="_blank"
        >
          <span class="align-vertical i-day"></span>
          &nbsp;
          <span class="align-vertical">{{ $t("menu.uniswap") }}</span>
        </a>
        <NavigationLink v-else :to="{ name: 'uniswap' }" icon="i-day">
          {{ $t("menu.uniswap") }}
        </NavigationLink>
        <NavigationLink
          v-if="networkId == 1"
          :to="{ name: 'ambix' }"
          icon="i-transfer"
        >
          {{ $t("menu.alembic") }}
        </NavigationLink>
        <a
          href="https://riot.im/app/#/room/#robonomics:matrix.org"
          target="_blank"
        >
          <span
            class="align-vertical"
            style="
              background: url('img/riot-icon.png') 0% 0% / contain;
              width: 16px;
              height: 16px;
              display: inline-block;
            "
          ></span>
          &nbsp;
          <span class="align-vertical">{{ $t("menu.riot") }}</span>
        </a>
      </Navigation>
    </Item>
    <Item bottom :canExpand="false" v-if="!$robonomics.account">
      <a
        href="javascript:;"
        @click="connect"
        class="sidebar-i--lg"
        style="color: #e88100;"
        :title="$t('sidebar.connect')"
      >
        <i class="i-user"></i>
      </a>
    </Item>
    <Item bottom icon="i-user" v-if="$robonomics.account">
      <Wallet :account="account" :networkId="networkId" :tokens="balances" />
    </Item>
    <Item bottom icon="i-info">
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
    </Item>
  </SidebarPanel>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import config from "~config";
import {
  SidebarPanel,
  Logo,
  Item,
  Navigation,
  NavigationLink,
  Wallet
} from "./sidebar";
import { isBrave } from "@/utils/tools";

export default {
  components: {
    SidebarPanel,
    Logo,
    Item,
    Navigation,
    NavigationLink,
    Wallet
  },
  data() {
    return {
      account: null,
      isBrave: true
    };
  },
  computed: {
    ...mapGetters("tokens", ["balance", "token"]),
    ...mapState("chain", ["networkId"]),
    balances() {
      const balances = [];
      if (this.$robonomics.account) {
        Object.values(config.chain.get().TOKEN).forEach((item) => {
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
      }
      return balances;
    }
  },
  async created() {
    this.isBrave = await isBrave();
    if (this.$robonomics.account) {
      this.account = this.$robonomics.account.address;
      Object.values(config.chain.get().TOKEN).forEach((item) => {
        this.$store.dispatch("tokens/add", item.address);
        this.$store.dispatch("tokens/watchBalance", {
          token: item.address,
          account: this.$robonomics.account.address
        });
      });
    }
  },
  methods: {
    async connect() {
      this.$store.dispatch("chain/accessAccount", false);
    }
  }
};
</script>
