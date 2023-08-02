<template>
  <robo-layout-section>
    <robo-grid
      offset="x0"
      gap="x1"
      valign="start"
      galign="start"
      minColumnWidth="550px"
      maxColumnWidth="1fr"
    >
      <!-- {
                  src: 'https://static.robonomics.network/dapp/Robonomics-smart-home-intro.webm',
                  type: 'video/webm'
                },
                {
                  src: 'https://static.robonomics.network/dapp/Robonomics-smart-home-intro.mp4',
                  type: 'video/mp4'
                } -->

      <robo-video
        autoplay
        loop
        :sources="[
          {
            src: 'https://crustipfs.art/ipfs/QmStCDsEHCYwVYvnDdmZBMnobPmrgZx3iJLm65b8XNzKQa',
            type: 'video/mp4'
          }
        ]"
        script="<p>Robonomics is a decentralized cloud service that can be used to enhance
                your smart home system. It addresses two main problems: the lack of
                control over data shared with vendors or third parties, and the vulnerability of
                smart homes to centralized cloud server shutdowns.</p>
                <p>With Robonomics, you can take advantage of its secure,
                  serverless, and decentralized cloud service to improve the functionality of
                  your smart home. Plus, you can use it with a wide range of Zigbee smart devices
                  to automate and control various aspects of your home.</p>
                <p>Installing Robonomics on top of Home Assistant is easy, and there are
                   several options to choose from. Simply select the method that works best for you
                   and your smart home on wiki.robonomics.network.</p>"
      />

      <robo-grid-item align="stretch">
        <robo-grid
          offset="x0"
          gap="x1"
          minColumnWidth="270px"
          maxColumnWidth="1fr"
        >
          <robo-card fixedButton>
            <robo-grid offset="x0" gap="x05" valign="start">
              <robo-icon icon="current-version" size="big" />
              <div>
                <robo-text title="4">Your RWS subscriptions</robo-text>
              </div>
            </robo-grid>
            <robo-button :router="store.state.robonomicsUIvue.rws.links.list">
              View details
            </robo-button>
          </robo-card>

          <robo-card :pale="rws?.length < 1" fixedButton>
            <robo-grid offset="x0" gap="x05" valign="start">
              <robo-icon icon="plug" size="big" />
              <div>
                <robo-text title="4">Control smart devices</robo-text>
              </div>
            </robo-grid>
            <robo-button
              :router="store.state.robonomicsUIvue.rws.links.devices"
              :disabled="rws?.length < 1"
            >
              Manage devices
            </robo-button>
          </robo-card>

          <robo-card :pale="rws?.length < 1" fixedButton>
            <robo-grid offset="x0" gap="x05" valign="start">
              <robo-icon icon="user-group" size="big" />
              <div>
                <robo-text title="4">Share your telemetry</robo-text>
              </div>
            </robo-grid>
            <robo-button
              :router="store.state.robonomicsUIvue.rws.links.users"
              :disabled="rws?.length < 1"
            >
              Manage Users
            </robo-button>
          </robo-card>

          <robo-card>
            <robo-text title="4" offset="x0">Need help?</robo-text>
            <robo-grid gap="x05" offset="x1">
              <robo-text size="small" weight="bold">
                <robo-link href="https://wiki.robonomics.network">
                  Wiki
                </robo-link>
                - Tutorials
              </robo-text>
              <robo-text size="small" weight="bold">
                <robo-link
                  href="https://github.com/airalab/dapp.robonomics.network"
                >
                  Github</robo-link
                >
                - Bugs & improvements
              </robo-text>
              <robo-text size="small" weight="bold">
                <robo-link href="https://discord.gg/JpaN2XAmqY">
                  Discord
                </robo-link>
                - Team support
              </robo-text>
            </robo-grid>
          </robo-card>
        </robo-grid>
      </robo-grid-item>
    </robo-grid>
  </robo-layout-section>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

// /* + get rws */
const store = useStore();
const rws = computed(() => {
  return store.state.robonomicsUIvue.rws.list;
});
/* - get rws */
</script>
