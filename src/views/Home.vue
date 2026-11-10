<template>
  <robo-layout-section width="middle-wide">
    <robo-grid minColumnWidth="260px" gap="x2">
      <robo-section>
        <robo-section card v-if="rwsactive && rwsactive !== ''">
          <robo-rws-setup-active
            :show="['name', 'owner', 'date', 'userstext', 'link']"
          />
          <robo-button :router="linkDevices" size="small" block>
            <robo-icon icon="house-signal-solid" /> Open devices & control
          </robo-button>
        </robo-section>

        <robo-section card v-else>
          <robo-text title="4" align="left">Start here</robo-text>
          <ol class="steps">
            <li>
              <robo-text weight="bold">Get XRT</robo-text>
              <robo-text size="small">
                The subscription is paid in XRT, the Robonomics token. You
                need a Polkadot wallet with a little XRT on Robonomics.
              </robo-text>
              <robo-text size="small">
                <a :href="uniswap" target="_blank" rel="noopener">Uniswap ↗</a>
                ·
                <a
                  href="https://wiki.robonomics.network/docs/getting-started/#2-get-xrt"
                  target="_blank"
                  rel="noopener"
                  >Other ways to get XRT ↗</a
                >
              </robo-text>
            </li>

            <li>
              <robo-text weight="bold">Buy a subscription</robo-text>
              <robo-text size="small">
                From <b>~{{ price }} XRT</b>, active in about 2 minutes.
                Available now: <b>{{ freeAuctions ?? "…" }}</b>
              </robo-text>
              <robo-status
                v-if="freeAuctions === 0"
                type="warning"
                class="steps-note"
              >
                No subscriptions are available right now. New ones open after
                a governance vote.
                <a
                  href="https://wiki.robonomics.network/docs/legacy-pallets/#current-state"
                  target="_blank"
                  rel="noopener"
                  >Why ↗</a
                >
              </robo-status>
              <robo-button
                v-else
                :router="linkActivate"
                size="small"
                block
              >
                <robo-icon icon="wallet" /> Buy a subscription
              </robo-button>
            </li>

            <li>
              <robo-text weight="bold">Connect Home Assistant</robo-text>
              <robo-text size="small">
                Install the Robonomics integration in Home Assistant, then add
                your subscription here to control your home from anywhere.
              </robo-text>
              <robo-button :router="linkSetupNew" size="small" block outlined>
                Add a setup
              </robo-button>
              <robo-text size="small">
                <a
                  href="https://wiki.robonomics.network/docs/connect-devices/#home-assistant"
                  target="_blank"
                  rel="noopener"
                  >Home Assistant integrations ↗</a
                >
              </robo-text>
            </li>
          </ol>
        </robo-section>
      </robo-section>

      <robo-section>
        <robo-text title="4" align="left" offset="x05"
          >Open-source hardware & web3 cloud</robo-text
        >
        <robo-text size="small" weight="normal-italic">
          <robo-grid gap="x05" columns="1">
            <robo-grid-item borderbottom>
              <robo-icon icon="check" /> Your data is encrypted, only you can
              read it
            </robo-grid-item>
            <robo-grid-item borderbottom>
              <robo-icon icon="check" /> Remote control without a corporate
              cloud
            </robo-grid-item>
            <robo-grid-item borderbottom>
              <robo-icon icon="check" /> One smart home for devices of any
              brand
            </robo-grid-item>
            <robo-grid-item>
              <robo-icon icon="check" /> Update your Robonomics devices
              yourself over USB-C
            </robo-grid-item>
          </robo-grid>
        </robo-text>

        <robo-text title="4" align="left" offset="x05" class="also"
          >Also in the app</robo-text
        >
        <robo-text size="small">
          <robo-grid gap="x05" columns="1">
            <robo-grid-item borderbottom>
              <router-link to="/device-tree">Device tree</router-link>
            </robo-grid-item>
            <robo-grid-item borderbottom>
              <router-link to="/datalog">Send your first record</router-link>
            </robo-grid-item>
            <robo-grid-item borderbottom>
              <router-link to="/altruist">Altruist sensor readings</router-link>
            </robo-grid-item>
            <robo-grid-item borderbottom>
              <router-link to="/energy-monitor">Energy monitor</router-link>
            </robo-grid-item>
            <robo-grid-item borderbottom>
              <router-link to="/dtwin">Digital twin</router-link>
            </robo-grid-item>
            <robo-grid-item>
              <a href="https://sensors.social" target="_blank" rel="noopener"
                >Sensors map ↗</a
              >
            </robo-grid-item>
          </robo-grid>
        </robo-text>
      </robo-section>
    </robo-grid>
  </robo-layout-section>
</template>

<script>
import { fromUnit } from "@/utils/tools";
import { bnToBn } from "@polkadot/util";
import { usePolkadotApi } from "robonomics-interface-vue";
import { useAvailableSubscriptions } from "robonomics-interface-vue/subscription";
import { computed, onUnmounted, ref, watch } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const price = ref(0);
    let unsubscribeBlock = null;

    const store = useStore();
    // the active setup is remembered in the browser; show it only while it
    // is still in the saved list, otherwise fall back to "Start here"
    const rwsactive = computed(() => {
      const { active, list } = store.state.robonomicsUIvue.rws;
      if (!active || !Array.isArray(list)) {
        return "";
      }
      return list.some((item) => item.owner === active) ? active : "";
    });
    const linkActivate = computed(() => {
      return store.state.robonomicsUIvue.rws.links.activate;
    });
    const linkSetupNew = computed(() => {
      return store.state.robonomicsUIvue.rws.links.setupnew;
    });
    const linkDevices = computed(() => {
      return store.state.robonomicsUIvue.rws.links.devices;
    });

    const { isConnected, instance } = usePolkadotApi();
    const { data: freeAuctions } = useAvailableSubscriptions();

    watch(
      isConnected,
      async (isConnected) => {
        if (isConnected) {
          const minimalBid = instance.api.consts.rws.minimalBid;
          price.value = minimalBid.add(bnToBn(1));
        }
      },
      { immediate: true }
    );

    onUnmounted(() => {
      if (unsubscribeBlock) {
        unsubscribeBlock();
      }
    });

    const priceFormat = computed(() => {
      if (isConnected.value) {
        return fromUnit(price.value, 9, 0);
      }
      return 0;
    });

    return {
      rwsactive,
      linkActivate,
      linkSetupNew,
      linkDevices,
      uniswap:
        "https://app.uniswap.org/swap?chain=mainnet&inputCurrency=NATIVE&outputCurrency=0x1f752250f518e419f2f03804e25728c5c6dff73f",
      freeAuctions,
      price: priceFormat
    };
  }
};
</script>

<style>
.steps {
  margin: var(--robo-space) 0 0;
  padding-left: 1.2em;
}
.steps li {
  margin-bottom: calc(var(--robo-space) * 1.5);
}
.steps li > * + * {
  margin-top: calc(var(--robo-space) * 0.5);
}
.also {
  margin-top: calc(var(--robo-space) * 3);
}
#home-links .robo-link {
  position: relative;
  display: block;
  background-color: var(--robo-color-blue-80);
  min-height: 150px;
  color: var(--robo-color-light);
  padding: var(--robo-space);
  font-weight: bold;
  text-transform: uppercase;
}

#home-links .robo-link:before {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15px;
  background-color: var(--robo-color-blue);
  z-index: 1;
  transition: 0.2s all;
}

#home-links .robo-link:hover::before {
  height: 100%;
}

#home-links .robo-link span {
  display: block;
  margin-top: 30px;
  position: relative;
  z-index: 2;
}
</style>
