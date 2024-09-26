<template>
  <robo-layout-header
    logoIcon="images/icon_white.svg"
    :navigation="navigation"
    :title="title"
    :version="version"
    v-if="renderComponent"
  />
</template>

<script>
import { fromUnit, round } from "@/utils/tools";
import axios from "axios";
import { toRaw } from "vue";

export default {
  props: {
    title: {
      type: String,
      default: "Robonomics Dapp"
    }
  },
  inject: ["RobonomicsProvider"],
  data() {
    return {
      renderComponent: true,
      navigation: [
        {
          title: "Services",
          links: [
            {
              title: "Sensors map",
              link: "https://sensors.robonomics.network",
              type: "external"
            }
          ]
        },

        {
          title: "Tokenomics",
          links: [
            {
              title: "About XRT",
              link: "https://robonomics.network/xrt/",
              type: "external"
            },
            {
              title: "Uniswap",
              link: "https://app.uniswap.org/#/swap?inputCurrency=0x7de91b204c1c737bcee6f000aaa6569cf7061cb7&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              type: "external"
            },
            {
              title: "Basilisk",
              link: "https://app.basilisk.cloud/pools-and-farms",
              type: "external"
            }
          ]
        },

        {
          title: "Tools",
          links: [
            {
              title: "Substrate Portal",
              link: "https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama.rpc.robonomics.network%2F#/explorer",
              type: "external"
            },
            {
              title: "Subscan",
              link: "https://robonomics.subscan.io/",
              type: "external"
            },
            {
              title: "Polkassembly",
              link: "https://robonomics.polkassembly.io/",
              type: "external"
            }
          ]
        }
      ],
      version: " "
    };
  },
  computed: {
    robonomics: function () {
      return toRaw(this.RobonomicsProvider.instance.value);
    }
  },
  watch: {
    "$store.state.robonomicsUIvue.polkadot.extensionObj": function (value) {
      if (
        value.signer &&
        value.signer.signRaw &&
        this.$store.state.robonomicsUIvue.polkadot.address
      ) {
        this.handlerAccount(this.$store.state.robonomicsUIvue.polkadot.address);
      }
    },
    "$store.state.robonomicsUIvue.polkadot.address": {
      handler: function (value) {
        if (
          value &&
          this.$store.state.robonomicsUIvue.polkadot.extensionObj.signer &&
          this.$store.state.robonomicsUIvue.polkadot.extensionObj.signer.signRaw
        ) {
          this.handlerAccount(value);
        }
      },
      immediate: true
    },
    "RobonomicsProvider.isReady.value": {
      handler: function (newValue, oldValue) {
        if (newValue && !oldValue) {
          this.handlerAccount(
            this.$store.state.robonomicsUIvue.polkadot.address
          );
        }
      },
      immediate: true
    },
    $route: async function () {
      this.renderComponent = false;
      await this.$nextTick();
      this.renderComponent = true;
    }
  },
  async created() {
    try {
      const res = await axios.get(
        "https://api.github.com/repos/airalab/dapp.robonomics.network/releases/latest"
      );
      if (res.data.tag_name) {
        this.version = res.data.tag_name;
      }
    } catch (_) {
      console.log("dApp version not found.");
    }
  },
  methods: {
    async handlerAccount(address) {
      if (!this.RobonomicsProvider.isReady.value) {
        return;
      }
      if (this.unsubscribeBalance) {
        this.unsubscribeBalance();
      }
      const account = this.$store.state.robonomicsUIvue.polkadot.accounts.find(
        (item) => item.address === address
      );
      if (!account) {
        return;
      }
      if (this.$route.name !== "telemetry") {
        await this.robonomics.accountManager.setSender(address, {
          type: account.type,
          extension: this.$store.state.robonomicsUIvue.polkadot.extensionObj
        });
      }
      this.unsubscribeBalance = await this.robonomics.account.getBalance(
        address,
        (r) => {
          const transferable = r.free.sub(r.frozen);
          this.$store.commit(
            "polkadot/setBalanceXRT",
            round(
              fromUnit(
                transferable,
                this.robonomics.api.registry.chainDecimals[0]
              ),
              4
            )
          );
        }
      );
    }
  }
};
</script>
