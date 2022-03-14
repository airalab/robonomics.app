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
      <!-- <router-link :to="{ name: 'iot-twins' }" active-class="active" exact>
        Digital twins
      </router-link>
      <router-link :to="{ name: 'rws' }" active-class="active" exact>
        Subscription
      </router-link> -->
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
      <a
        href="https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama.rpc.robonomics.network%2F#/explorer"
        target="_blank"
      >
        {{ $t("menu.parachain") }}
      </a>
    </RSidebarSection>
    <RSidebarSection title="For tokenholders">
      <a
        href="https://app.uniswap.org/#/swap?inputCurrency=0x7de91b204c1c737bcee6f000aaa6569cf7061cb7&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        target="_blank"
      >
        {{ $t("menu.uniswap") }}
      </a>
      <router-link :to="{ name: 'xrt-for-vote' }" active-class="active" exact>
        {{ $t("menu.votes") }}
      </router-link>
      <router-link :to="{ name: 'ambix' }" active-class="active" exact>
        {{ $t("menu.alembic") }}
      </router-link>
      <router-link :to="{ name: 'exodus' }" active-class="active" exact>
        {{ $t("menu.exodus") }}
      </router-link>
      <router-link :to="{ name: 'staking' }" active-class="active" exact>
        Staking
      </router-link>
      <router-link :to="{ name: 'pioneer' }" active-class="active" exact>
        NFT card
      </router-link>
      <router-link
        :to="{ name: 'bonus-for-pioneer' }"
        active-class="active"
        exact
      >
        Pioneers rewards
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
