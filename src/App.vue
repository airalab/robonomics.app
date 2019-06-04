<template>
  <fragment>
    <Sidebar/>
    <div class="content">
      <div class="content-in">
        <web3-check>
          <template v-slot:error="props">
            <DepNetwork v-if="props.error.type === 'network'"/>
            <NotAccounts v-else-if="props.error.type === 'account'"/>
            <NotWeb3 v-else/>
          </template>
          <template slot="load">
            <Load/>
          </template>
          <fragment>
            <fragment v-if="ready">
              <Wallet :loader="loader"/>
              <router-view/>
            </fragment>
            <Load v-else/>
          </fragment>
        </web3-check>
      </div>
    </div>
  </fragment>
</template>

<script>
import Vue from "vue";
import Web3Check from "vue-web3-check";
import Sidebar from "./components/Sidebar";
import Wallet from "./components/Wallet";
import NotWeb3 from "./components/web3/NotWeb3";
import DepNetwork from "./components/web3/DepNetwork";
import NotAccounts from "./components/web3/NotAccounts";
import Load from "./components/web3/Load";
import { initRobonomics } from "./utils/robonomics";
import getIpfs from "./utils/ipfs";

export default {
  name: "app",
  data() {
    return {
      ready: false
    };
  },
  mounted() {
    Web3Check.store.on("load", state => {
      getIpfs().then(ipfs => {
        Vue.prototype.$robonomics = initRobonomics(ipfs, state.networkId);
        this.$robonomics.ready().then(() => {
          this.ready = true;
        });
      });
    });
  },
  components: {
    Sidebar,
    Wallet,
    NotWeb3,
    DepNetwork,
    NotAccounts,
    Load
  },
  methods: {
    requestAccount() {
      Web3Check.access();
    },
    loader() {
      this.ready = false;
      setTimeout(() => {
        this.ready = true;
      }, 2000);
    }
  }
};
</script>
