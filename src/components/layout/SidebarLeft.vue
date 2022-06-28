<template>
  <robo-grid-item media-mobile="collapse-left" collapse-text="Navigation">
    <robo-sidebar title="Dapp" icon="house">
      <robo-sidebar-item :router="{ name: 'dashboard' }" current>
        Dashboard
      </robo-sidebar-item>
      <!-- <robo-sidebar-item to="/settings">Settings</robo-sidebar-item> -->
    </robo-sidebar>

    <robo-sidebar title="IoT services" icon="cloud">
      <!-- <robo-sidebar-item href="/iot-devices">Devices</robo-sidebar-item> -->
      <robo-sidebar-item :router="{ name: 'services' }">
        Services
      </robo-sidebar-item>
      <robo-sidebar-item :router="{ name: 'subscription-bid' }">
        Subscription
      </robo-sidebar-item>
    </robo-sidebar>

    <robo-sidebar title="Tokenomics" icon="chart-pie">
      <!-- <robo-sidebar-item href="/exodus">Exodus</robo-sidebar-item>
      <robo-sidebar-item href="/staking">Staking</robo-sidebar-item>
      <robo-sidebar-item href="/claim-nft">Claim NFT</robo-sidebar-item>
      <robo-sidebar-item href="/dao-votes">DAO votes</robo-sidebar-item>
      <robo-sidebar-item href="/aira-to-xrt">Aira to XRT</robo-sidebar-item> -->
      <robo-sidebar-item
        href="https://app.uniswap.org/#/swap?inputCurrency=0x7de91b204c1c737bcee6f000aaa6569cf7061cb7&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      >
        Uniswap
      </robo-sidebar-item>
      <robo-sidebar-item href="https://robonomics.network/xrt/">
        About XRT
      </robo-sidebar-item>
    </robo-sidebar>
  </robo-grid-item>
</template>
