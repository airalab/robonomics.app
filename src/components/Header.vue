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
            <li>
              <router-link
                :to="$store.state.robonomicsUIvue.rws.links.activate"
                exact
              >
                Buy/renew a subscription
              </router-link>
            </li>
            <li>
              <router-link
                :to="$store.state.robonomicsUIvue.rws.links.setupnew"
                exact
              >
                New setup
              </router-link>
            </li>
            <li>
              <router-link
                :to="$store.state.robonomicsUIvue.rws.links.setup"
                exact
              >
                Your setup<template
                  v-if="$store.state.robonomicsUIvue.rws.list.length > 1"
                  >s
                </template>
              </router-link>
            </li>
            <li>
              <router-link
                :to="$store.state.robonomicsUIvue.rws.links.devices"
                exact
              >
                Devices & Control
              </router-link>
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
import { usePolkadotApi } from "robonomics-interface-vue";
import { useAccount, useBalance } from "robonomics-interface-vue/account";
import { nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { useAccounts } from "../hooks/useAccounts";

export default {
  props: {
    title: {
      type: String,
      default: "Robonomics Dapp"
    }
  },
  setup() {
    const { isConnected } = usePolkadotApi();
    const store = useStore();
    const route = useRoute();
    const { setSender } = useAccounts();
    const { account } = useAccount();
    const { balance } = useBalance(account);

    watch(balance, () => {
      if (balance.value) {
        store.commit(
          "polkadot/setBalanceXRT",
          round(fromUnit(balance.value, 9), 4)
        );
      }
    });

    const handlerAccount = async (address) => {
      try {
        if (!isConnected.value) {
          return;
        }
        if (!store.state.robonomicsUIvue.polkadot.accounts) {
          return;
        }
        const account = store.state.robonomicsUIvue.polkadot.accounts.find(
          (item) => item.address === address
        );
        if (!account) {
          return;
        }
        if (route.name !== "telemetry") {
          setSender(
            address,
            store.state.robonomicsUIvue.polkadot.extensionObj.signer,
            account.type
          );
        }
      } catch (e) {
        console.error(e);
      }
    };

    watch(
      () => store.state.robonomicsUIvue.polkadot.extensionObj,
      (value) => {
        if (
          value.signer &&
          value.signer.signRaw &&
          store.state.robonomicsUIvue.polkadot.address
        ) {
          handlerAccount(store.state.robonomicsUIvue.polkadot.address);
        }
      },
      { immediate: true, deep: true }
    );
    watch(
      () => store.state.robonomicsUIvue.polkadot.address,
      (value) => {
        if (
          value &&
          store.state.robonomicsUIvue.polkadot.extensionObj.signer &&
          store.state.robonomicsUIvue.polkadot.extensionObj.signer.signRaw
        ) {
          handlerAccount(value);
        }
      },
      { immediate: true }
    );
    watch(
      isConnected,
      (newValue, oldValue) => {
        if (newValue && !oldValue) {
          handlerAccount(store.state.robonomicsUIvue.polkadot.address);
        }
      },
      { immediate: true }
    );

    const renderComponent = ref(true);
    watch(route, async () => {
      renderComponent.value = false;
      await nextTick();
      renderComponent.value = true;
    });

    return { renderComponent };
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
