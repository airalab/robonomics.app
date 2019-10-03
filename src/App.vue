<template>
  <web3-check>
    <template v-slot:error="props">
      <DepNetwork v-if="props.error.type === 'network'" />
      <NotAccounts v-else-if="props.error.type === 'account'" />
      <NotWeb3 v-else />
    </template>
    <template slot="load">
      <Load />
    </template>
    <template>
      <template v-if="isReadyRobonomics">
        <Sidebar :loadContent="loadContent" />
        <div class="content">
          <div class="content-in">
            <router-view v-if="isReadyContent" />
            <section v-else>
              <div class="loader">
                <div class="loader-ring align-vertical m-r-15"></div>
              </div>
            </section>
          </div>
        </div>
      </template>
      <Load v-else />
    </template>
  </web3-check>
</template>

<script>
import Vue from "vue";
import Web3Check from "vue-web3-check";
import Sidebar from "./components/common/Sidebar";
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
      isReadyRobonomics: false,
      isReadyContent: true
    };
  },
  mounted() {
    this.$store.dispatch("theme/init");
    Web3Check.store.on("load", state => {
      this.$store
        .dispatch("token/init", {
          account: state.account,
          networkId: state.networkId
        })
        .then(() => getIpfs())
        .then(ipfs => {
          const boot = function() {
            ipfs.swarm.connect(
              "/dns4/pubsub.devcon50.aira.life/tcp/443/wss/ipfs/QmToTQ5VEUWRmxN1zpefn5g3cQ8jqc49QVs5Fqap2n4DjC"
            );
          };

          Vue.prototype.$robonomics = initRobonomics(ipfs, state.networkId);
          this.$robonomics.ready().then(() => {
            this.isReadyRobonomics = true;
            boot();
            setInterval(() => {
              boot();
            }, 5000);
          });
        });
    });
  },
  components: {
    Sidebar,
    NotWeb3,
    DepNetwork,
    NotAccounts,
    Load
  },
  methods: {
    requestAccount() {
      Web3Check.access();
    },
    loadContent() {
      this.isReadyContent = false;
      setTimeout(() => {
        this.isReadyContent = true;
      }, 2000);
    }
  }
};
</script>
