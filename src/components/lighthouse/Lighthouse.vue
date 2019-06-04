<template>
  <section>
    <h2>
      <router-link to="/lighthouse" class="align-vertical m-r-10 i-back"></router-link>
      <span class="align-vertical m-r-20 breakwords">{{ this.$route.params.lighthouse }}</span>
    </h2>
    <div class="row" v-if="lighthouse">
      <div class="col-lg-4 col-md-5 order-md-last">
        <section>
          <LighthouseDetails :lighthouse="lighthouse"/>
        </section>
      </div>
      <div class="col-lg-8 col-md-7">
        <Providers :lighthouse="lighthouse"/>
        <LighthouseMarket/>
      </div>
    </div>
  </section>
</template>

<script>
import LighthouseDetails from "./LighthouseDetails";
import LighthouseMarket from "./LighthouseMarket";
import Providers from "./Providers";

export default {
  components: {
    LighthouseDetails,
    LighthouseMarket,
    Providers
  },
  data() {
    return {
      lighthouse: "",
      showApprove: false
    };
  },
  mounted() {
    this.$on("approve", data => {
      this.showApprove = data;
    });
    return this.fetchData();
  },
  methods: {
    async fetchData() {
      const lighthouseName = this.$route.params.lighthouse;
      let lighthouseAddr = await this.$robonomics.ens.addrLighthouse(
        lighthouseName
      );
      lighthouseAddr = this.$robonomics.web3.toChecksumAddress(lighthouseAddr);
      if (
        this.$robonomics.lighthouse === null ||
        lighthouseAddr !== this.$robonomics.lighthouse.address
      ) {
        this.$robonomics.initLighthouse(lighthouseName).then(() => {
          this.lighthouse = lighthouseAddr;
          this.$store.dispatch("providers/init");
          this.$store.dispatch("messages/init");
        });
      } else {
        this.lighthouse = lighthouseAddr;
        this.$store.dispatch("providers/init");
        this.$store.dispatch("messages/init");
      }
    }
  }
};
</script>
