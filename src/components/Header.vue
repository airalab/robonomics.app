<template>
  <robo-layout-header
    logoIcon="images/icon_white.svg"
    :title="title"
    v-if="renderComponent"
  >

  <template #nav>
    <robo-section>
      <robo-text title="3" linemiddle offset="x05"><span>Hardware for Cryptopunks Control & Telemetry</span></robo-text>
      <nav class="nav-devices">
        <ul>
          <li>
            <router-link to="/hardware/season-pass" exact>
              <img src="images/season-pass-24-25-monkey.webp" />
              <span>Season pass</span>
            </router-link>
          </li>
          <li>
            <router-link to="/hardware/altruist" exact>
              <img src="images/hardware/altruist.webp" />
              <span>Altruist Outdoor Sensor</span>
            </router-link>
          </li>
          <li>
            <router-link to="/hardware/riscv" exact>
              <img src="images/hardware/risc-v.webp" />
              <span>Risc-V Smart Home</span>
            </router-link>
          </li>
          <li>
            <router-link to="/hardware/hikikomori" exact>
              <img src="images/hardware/hikikomori.webp" />
              <span>Hikikomori</span>
            </router-link>
          </li>
          <li>
            <router-link to="/hardware/smart-safe" exact>
              <img src="images/hardware/smart-safe.webp" />
              <span>Smart safe</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </robo-section>

    <robo-section>
      <robo-text title="3" linemiddle offset="x05"><span>Robonomics Web Services Control & Telemetry</span></robo-text>
      <nav class="nav-rws">
        <ul>
          <li><router-link :to="$store.state.robonomicsUIvue.rws.links.activate" exact>Your subscription</router-link></li>
          <li><router-link :to="$store.state.robonomicsUIvue.rws.links.setupnew" exact>New configuration</router-link></li>
          <!-- <li v-if="$store.state.robonomicsUIvue.rws.list.length > 0"> -->
          <li>
            <router-link :to="$store.state.robonomicsUIvue.rws.links.setup" exact>Your configuration<template v-if="$store.state.robonomicsUIvue.rws.list.length > 1">s</template></router-link>
          </li>
          <!-- <li v-if="$store.state.robonomicsUIvue.rws.list.length > 0"> -->
          <li>
            <router-link :to="$store.state.robonomicsUIvue.rws.links.devices" exact>Devices & Control</router-link>
          </li>
        </ul>
      </nav>
    </robo-section>
  </template>
  </robo-layout-header>
</template>

<script>
import { fromUnit, round } from "@/utils/tools";
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
      // navigation: [
      //   {
      //     title: "Services",
      //     links: [
      //       {
      //         title: "Sensors map",
      //         link: "https://sensors.robonomics.network",
      //         type: "external"
      //       }
      //     ]
      //   },

      //   {
      //     title: "Tokenomics",
      //     links: [
      //       {
      //         title: "About XRT",
      //         link: "https://robonomics.network/xrt/",
      //         type: "external"
      //       },
      //       {
      //         title: "Uniswap",
      //         link: "https://app.uniswap.org/#/swap?inputCurrency=0x7de91b204c1c737bcee6f000aaa6569cf7061cb7&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      //         type: "external"
      //       },
      //       {
      //         title: "Basilisk",
      //         link: "https://app.basilisk.cloud/pools-and-farms",
      //         type: "external"
      //       }
      //     ]
      //   },

      //   {
      //     title: "Tools",
      //     links: [
      //       {
      //         title: "Substrate Portal",
      //         link: "https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama.rpc.robonomics.network%2F#/explorer",
      //         type: "external"
      //       },
      //       {
      //         title: "Subscan",
      //         link: "https://robonomics.subscan.io/",
      //         type: "external"
      //       },
      //       {
      //         title: "Polkassembly",
      //         link: "https://robonomics.polkassembly.io/",
      //         type: "external"
      //       }
      //     ]
      //   },
      //   {
      //     title: "Robonomics Parachain",
      //     links: [
      //       {
      //         title: "Polkadot",
      //         link: "/?rpc=wss%3A%2F%2Fpolkadot.rpc.robonomics.network%2F"
      //       },
      //       {
      //         title: "Kusama",
      //         link: "/?rpc=wss%3A%2F%2Fkusama.rpc.robonomics.network%2F"
      //       }
      //     ]
      //   }
      // ],
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
  methods: {
    // setCurrentNetwork() {
    //   let network = "kusama";
    //   const endpoint = localStorage.getItem("rpc-parachain");
    //   if (endpoint) {
    //     network = URL.parse(endpoint).host.split(".")[0];
    //   }
    //   if (network === "polkadot") {
    //     this.navigation[3].links[0] = {
    //       title: `›Polkadot`
    //     };
    //   } else {
    //     this.navigation[3].links[1] = {
    //       title: `›Kusama`
    //     };
    //   }
    // },
    async handlerAccount(address) {
      try{

        if (!this.RobonomicsProvider.isReady.value) {
          return;
        }
        if (this.unsubscribeBalance) {
          this.unsubscribeBalance();
        }
        // this.setCurrentNetwork();
        if (!this.$store.state.robonomicsUIvue.polkadot.accounts) {
          return;
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
      } catch (e) { console.error(e); }
    }
  }
};
</script>

<style scoped>
  .nav-devices ul, .nav-rws ul {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    font-weight: bold;
    gap: calc(var(--robo-space) * 2);
    text-align: center;
  }

  .nav-rws {
    max-width: 720px;
  }

  .nav-rws ul {
    text-align: left;
    grid-template-columns: repeat(4, 1fr);
  }

  .nav-devices a {
    color: var(--robo-color-dark);
    display: block;
    height: 100%;
    padding: .4rem;
    border-radius: 4px;
    text-align: center;
  }

  .nav-devices a:hover {
    background-color: var(--robo-color-light-90);
  }

  .nav-devices img {
    display: block;
    max-height: 100px;
    object-fit: contain;
    width: auto;
  }

  @media screen and (width < 950px) {
    .nav-devices ul {
      grid-template-columns: repeat(3, 1fr);
    }

    .nav-rws ul {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media screen and (width < 560px) {

    .nav-devices ul, .nav-rws ul {
      grid-template-columns: repeat(1, 1fr);
    }

    .nav-devices a {
      text-align: left;
      display: flex;
      gap: var(--robo-space);
    }

    .nav-devices img {
      max-width: 50px;
      max-height: auto;
    }
  }
</style>
