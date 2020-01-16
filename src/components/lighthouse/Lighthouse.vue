<template>
  <section>
    <h2 class="breadcrumbs m-b-0">
      <router-link to="/lighthouse">
        <span class="i-lighthouse"></span>
        <span>{{ $t("lighthouse.title") }}</span>
      </router-link>
      <i>/</i>
      <span>{{ this.$route.params.lighthouse }}</span>
    </h2>
    <SelectLighthouse
      :isCreate="false"
      :selectedLighthouse="lighthouseName"
      @connect="
        lighthouse => {
          $router.push({ path: `/lighthouse/${lighthouse}` });
          $router.go();
        }
      "
    />
    <div class="row" v-if="lighthouse">
      <div class="col-lg-4 col-md-5 order-md-last">
        <section>
          <LighthouseDetails :lighthouse="lighthouse" />
        </section>
      </div>
      <div class="col-lg-8 col-md-7">
        <LighthouseMarket />
        <Providers :lighthouse="lighthouse" />
      </div>
    </div>
  </section>
</template>

<script>
import SelectLighthouse from "./SelectLighthouse";
import LighthouseDetails from "./LighthouseDetails";
import LighthouseMarket from "./LighthouseMarket";
import Providers from "./Providers";

export default {
  components: {
    SelectLighthouse,
    LighthouseDetails,
    LighthouseMarket,
    Providers
  },
  data() {
    return {
      lighthouse: "",
      lighthouseName: "",
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
      this.lighthouseName = this.$route.params.lighthouse;
      let lighthouseAddr = await this.$robonomics.ens.addrLighthouse(
        this.lighthouseName
      );
      lighthouseAddr = this.$robonomics.web3.utils.toChecksumAddress(
        lighthouseAddr
      );
      if (
        this.$robonomics.lighthouse === null ||
        lighthouseAddr !== this.$robonomics.lighthouse.address
      ) {
        this.$robonomics.initLighthouse(this.lighthouseName).then(() => {
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
