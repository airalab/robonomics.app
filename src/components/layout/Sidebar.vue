<template>
  <RSidebar>
    <RSidebarSection title="Robonomics">
      <router-link :to="{ name: 'iot-start' }" active-class="active" exact>
        Getting started
      </router-link>
    </RSidebarSection>
    <RSidebarSection title="My devices">
      <router-link :to="{ name: 'iot-devices' }" active-class="active" exact>
        Devices
      </router-link>
      <router-link :to="{ name: 'iot-activity' }" active-class="active">
        {{ $t("menu.telemetry") }}
      </router-link>
      <router-link :to="{ name: 'iot-twins' }" active-class="active" exact>
        Digital twins
      </router-link>
      <router-link
        :to="{ name: 'rws' }"
        active-class="active"
        exact
        class="disabled"
      >
        Subscription
      </router-link>
    </RSidebarSection>
    <RSidebarSection title="Marketplace">
      <router-link :to="{ name: 'services' }" active-class="active" exact>
        {{ $t("menu.services") }}
      </router-link>
    </RSidebarSection>
    <RSidebarSection title="For providers">
      <router-link
        :to="{ name: 'lighthouseSelect' }"
        active-class="active"
        exact
      >
        {{ $t("menu.lighthouses") }}
      </router-link>
      <a href="https://parachain.robonomics.network/" target="_blank">
        {{ $t("menu.parachain") }}
      </a>
    </RSidebarSection>
    <RSidebarSection title="For tokenholders">
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
      <router-link :to="{ name: 'xrt-for-vote' }" active-class="active" exact>
        {{ $t("menu.votes") }}
      </router-link>
      <router-link :to="{ name: 'ambix' }" active-class="active" exact>
        {{ $t("menu.alembic") }}
      </router-link>
    </RSidebarSection>
    <RSidebarSection title="Wiki and support">
      <a href="https://robonomics.network/" target="_blank">
        robonomics.network
      </a>
      <a href="https://robonomics.events/" target="_blank">rewards</a>
      <a href="https://wiki.robonomics.network/" target="_blank"> wiki </a>
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
