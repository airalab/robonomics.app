<template>
  <main-layout :title="title">
    <template v-if="isReady">
      <router-view />
    </template>
    <robo-layout-section v-else gcenter>
      <robo-loader size="2" />
    </robo-layout-section>
  </main-layout>
</template>

<script>
import MainLayout from "@/components/layouts/Main.vue";
import { inject, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  name: "App",
  components: {
    MainLayout
  },
  setup() {
    const RobonomicsProvider = inject("RobonomicsProvider");
    const IpfsProvider = inject("IpfsProvider");
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const title = ref();

    store.commit("rws/setKey", process.env.VUE_APP_ROBONOMICS_UI_KEY);
    store.dispatch("rws/init");

    store.commit(
      "rws/setLinkActivate",
      router.resolve({ name: "rwsActivate" }).path
    );
    store.commit("rws/setLinkSetup", router.resolve({ name: "rwsSetup" }).path);
    store.commit(
      "rws/setLinkSetupnew",
      router.resolve({ name: "rwsSetupNew" }).path
    );
    store.commit(
      "rws/setLinkDevices",
      router.resolve({ name: "telemetry" }).path
    );
    store.commit("ipfs/setGateways", IpfsProvider.gateways);

    watch(route, () => {
      title.value = route?.meta?.title;
      document.title = title.value
        ? `${title.value} – Robonomics Network dApp`
        : "Robonomics Network dApp";
    });

    return {
      isReady: RobonomicsProvider.isReady,
      title
    };
  }
};
</script>
