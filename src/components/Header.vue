<template>
  <robo-layout-header
    logoIcon="images/icon_white.svg"
    :title="title"
    v-if="renderComponent"
  >

  <template #nav>

    <robo-section>
      <nav class="nav-rws">
        <ul>
          <li><router-link :to="$store.state.robonomicsUIvue.rws.links.activate" exact>Buy/renew a subscription</router-link></li>
          <li><router-link :to="$store.state.robonomicsUIvue.rws.links.setupnew" exact>New setup</router-link></li>
          <li>
            <router-link :to="$store.state.robonomicsUIvue.rws.links.setup" exact>Your setup<template v-if="$store.state.robonomicsUIvue.rws.list.length > 1">s</template></router-link>
          </li>
          <li>
            <router-link :to="$store.state.robonomicsUIvue.rws.links.devices" exact>Devices & Control</router-link>
          </li>
        </ul>
      </nav>
    </robo-section>

    <!-- <robo-section>
      <nav class="nav-devices">
        <ul>
          <li>
            <router-link to="/hardware/altruist" exact>
              <img src="images/hardware/altruist.webp" />
              <span>Air Quality Sensor “ALTRUIST“</span>
            </router-link>
          </li>
          <li>
            <router-link to="/hardware/riscv" exact>
              <img src="images/hardware/risc-v.webp" />
              <span>Home server with Web3 cloud</span>
            </router-link>
          </li>
          <li>
            <router-link to="/hardware/hikikomori" exact>
              <img src="images/hardware/hikikomori.webp" />
              <span>Smart Tamagotchi “Hikikomori“</span>
            </router-link>
          </li>
          <li>
            <router-link to="/hardware/energy-monitor" exact>
              <img src="images/hardware/e-monitor.webp" />
              <span>Energy monitor with USB-C</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </robo-section> -->

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
    async handlerAccount(address) {
      try{

        if (!this.RobonomicsProvider.isReady.value) {
          return;
        }
        if (this.unsubscribeBalance) {
          this.unsubscribeBalance();
        }
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
  .nav-rws ul {
    text-align: left;
    grid-template-columns: repeat(4, 1fr);
  }

  .nav-rws a {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    white-space: nowrap;
    text-transform: uppercase;
  }

  .nav-devices {
    margin-top: calc(var(--robo-space) * 2);
  }

  .nav-devices li {
    padding: var(--robo-space) 0;
    border-top: 1px solid var(--robo-color-dark);
  }

  .nav-devices a {
    display: grid;
    grid-template-columns: 100px auto;
    align-items: center;
    gap: var(--robo-space);
    font-weight: bold;
    text-transform: uppercase;
  }

  .nav-devices img {
    max-width: 100%;
    object-fit: contain;
  }

  .nav-devices li:not(:nth-child(2)) img {
    max-height: 92px;
  }

  .nav-devices li:nth-child(2) img {
    min-height: 100px;
  }


  @media screen and (width < 950px) {
    .nav-rws ul {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media screen and (width < 560px) {
    .nav-devices a {
      grid-template-columns: 50px auto;
    }
  }
</style>
