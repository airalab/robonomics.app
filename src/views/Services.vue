<template>
  <robo-layout-section>
    <robo-grid offset="x0" gap="x1" galign="start" minColumnWidth="450px">
      <robo-card>
        <robo-link router="/telemetry">
          <robo-image src="images/services-ha.jpg" />
        </robo-link>
        <robo-text title="3">
          <robo-link router="/telemetry">Home assistant</robo-link>
        </robo-text>
        <robo-text size="small">
          Integrate Robonomics into your Home assistant dashboard and get
          Parachain decentralized cloud service all over the word. Manipulate
          your smart devices bypassing corporate clouds, manage user access
          wherever you are. Backup your smart home data in blockchain.
        </robo-text>
      </robo-card>

      <robo-card>
        <robo-link href="https://sensors.robonomics.network/#/">
          <robo-image src="images/services-sensors.jpg" />
        </robo-link>
        <robo-text title="3">
          <robo-link href="https://sensors.robonomics.network/#/">
            Sensors Map
          </robo-link>
        </robo-text>
        <robo-text size="small">
          The decentralized opensource sensors map offers two distinct layers of
          decentralization at your choise: peer-to-peer connectivity for direct
          access to sensor data, and the federative concept for accumulating
          sensor data and displaying measurement history. Anyone can assemble
          your own sensor using components available on the free market.
        </robo-text>
      </robo-card>

      <robo-card>
        <robo-link href="https://dapp.spot-sdk.education">
          <robo-image src="images/services-spot.jpg" />
        </robo-link>
        <robo-text title="3">
          <robo-link href="https://dapp.spot-sdk.education">
            Boston Dynamics Spot SDK lessons
          </robo-link>
        </robo-text>
        <robo-text size="small">
          Learn and practice with the Boston Dynamics Spot robot wherever you
          are. After each lesson you will receive a captured video of the robot
          movements and a printable PDF certificate.
        </robo-text>
      </robo-card>

      <robo-card>
        <robo-link href="https://telescope.merklebot.com/#/">
          <robo-image src="images/services-telescope.jpg" />
        </robo-link>
        <robo-text title="3">
          <robo-link href="https://telescope.merklebot.com/#/">
            An Autonomous Telescope Minting RMRK NFT's
          </robo-link>
        </robo-text>
        <robo-text size="small">
          Connect to an autonomous telescope in the dark night of the Atacama
          desert in Chile to capture an astronomical object and mint unique NFTs
          in a few clicks.
        </robo-text>
      </robo-card>

      <robo-card>
        <robo-link href="https://dapp.ipci.io/#/offsetting">
          <robo-image src="images/services-offsetting.jpg" />
        </robo-link>
        <robo-text title="3">
          <robo-link href="https://dapp.ipci.io/#/offsetting">
            Smart Building Offsetting
          </robo-link>
        </robo-text>
        <robo-text size="small">
          Carbon footprint clearance for smart buildings based on geolocation
          and energy consumption information.
        </robo-text>
      </robo-card>
    </robo-grid>
  </robo-layout-section>
</template>

<script>
import { useSeoMeta } from '@unhead/vue';

export default {
  setup() {
    useSeoMeta({
      title: 'Services'
    })
  }
}
</script>