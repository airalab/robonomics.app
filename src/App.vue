<template>
  <RApp>
    <router-view />
  </RApp>
</template>

<script>
import Web3Check from "vue-web3-check";

export default {
  mounted() {
    Web3Check.store.on("load", state => {
      this.$store.dispatch("token/init", {
        account: state.account,
        networkId: state.networkId
      });
    });

    // const boot = function() {
    //   this.$ipfs.swarm.connect(
    //     "/dns4/pubsub.devcon50.aira.life/tcp/443/wss/ipfs/QmToTQ5VEUWRmxN1zpefn5g3cQ8jqc49QVs5Fqap2n4DjC"
    //   );
    // };
    // boot();
    // setInterval(() => {
    //   boot();
    // }, 5000);
  }
};
</script>
