<template>
  <Page>
    <section>
      <h2 class="breadcrumbs m-b-0">
        <span>
          <span class="i-signal m-r-10"></span>
          <span>{{ $t("sensors.title") }}</span>
        </span>
      </h2>
      <SelectLighthouse
        :isCreate="false"
        :selectedLighthouse="lighthouseNameFull"
        @connect="
          lighthouse => {
            $router.push({ path: `/sensors/${lighthouse.split('.')[0]}` });
            $router.go();
          }
        "
      />
      <Sensors v-if="lighthouse" :lighthouse="lighthouse" />
    </section>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import Sensors from "../components/sensors/Sensors";
import SelectLighthouse from "../components/lighthouse/SelectLighthouse";

export default {
  props: ["lighthouse"],
  components: {
    Page,
    Sensors,
    SelectLighthouse
  },
  computed: {
    lighthouseNameFull: function() {
      return this.lighthouse
        ? this.$robonomics.ens.getUrl(this.lighthouse, "lighthouse")
        : "";
    }
  },
  data() {
    return {
      ready: false
    };
  }
};
</script>
