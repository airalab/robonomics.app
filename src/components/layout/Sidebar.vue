<template>
  <RSidebar>
    <RSidebarSection title="dApp">
      <router-link :to="{ name: 'services' }" active-class="active" exact>
        {{ $t("menu.services") }}
      </router-link>
      <router-link
        :to="{ name: 'lighthouseSelect' }"
        active-class="active"
        exact
      >
        {{ $t("menu.lighthouses") }}
      </router-link>
      <router-link :to="{ name: 'telemetry' }" active-class="active" exact>
        {{ $t("menu.telemetry") }}
      </router-link>
      <a href="https://parachain.robonomics.network/" target="_blank">
        {{ $t("menu.parachain") }}
      </a>
      <a
        v-if="isBrave"
        href="https://uniswap.exchange/swap?outputCurrency=0x7dE91B204C1C737bcEe6F000AAA6569Cf7061cb7"
        target="_blank"
      >
        {{ $t("menu.uniswap") }}
      </a>
      <router-link v-else :to="{ name: 'uniswap' }" active-class="active" exact>
        {{ $t("menu.uniswap") }}
      </router-link>
      <router-link :to="{ name: 'ambix' }" active-class="active" exact>
        {{ $t("menu.alembic") }}
      </router-link>
      <router-link :to="{ name: 'rws' }" active-class="active" exact>
        {{ $t("menu.rws") }}
      </router-link>
      <router-link :to="{ name: 'xrt-for-vote' }" active-class="active" exact>
        {{ $t("menu.votes") }}
      </router-link>
    </RSidebarSection>
    <RSidebarSection title="Info">
      <a href="https://robonomics.network/" target="_blank">
        robonomics.network
      </a>
      <a href="https://robonomics.events/" target="_blank">rewards</a>
    </RSidebarSection>
    <RSidebarSection title="Help">
      <a
        href="https://riot.im/app/#/room/#robonomics:matrix.org"
        target="_blank"
      >
        Riot chat
      </a>
      <a href="https://t.me/robonomics" target="_blank">Telegram EN</a>
      <a href="https://t.me/joinchat/A6wE1FiSPStvVN4MKmZDyg" target="_blank">
        Telegram Trade EN
      </a>
      <a href="https://t.me/robonomicsru" target="_blank">Telegram RU</a>
    </RSidebarSection>
  </RSidebar>
</template>

<script>
import { isBrave } from "@/utils/tools";

export default {
  data() {
    return {
      isBrave: true
    };
  },
  async created() {
    this.isBrave = await isBrave();
  },
  mounted() {
    window.sidebar();
  }
};
</script>
