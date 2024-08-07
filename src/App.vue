<template>
  <main-layout v-if="isReady" :pagetitle="title">
    <router-view />
  </main-layout>
  <loader-layout v-else :pagetitle="title">
    <robo-layout-section gcenter>
      <robo-loader size="2" />
    </robo-layout-section>
  </loader-layout>
</template>

<script>
import LoaderLayout from "@/components/layouts/Loader.vue";
import MainLayout from "@/components/layouts/Main.vue";
import { inject, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  name: "App",
  components: {
    LoaderLayout,
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
      const resulttitle = title.value
        ? `${title.value} / Robonomics Dapp`
        : "Robonomics Dapp";
      document.title = resulttitle;
      document
        .querySelector('meta[property="og:title"]')
        .setAttribute("content", resulttitle);
    });

    watch(
      [route, RobonomicsProvider.isReady],
      ([route, isReady]) => {
        if (route.name !== "telemetry" && isReady) {
          store.dispatch("app/setlibp2p", {
            connected: false
          });
          store.dispatch("app/setrelay", {
            connected: false
          });
        }
      },
      { immediate: true }
    );

    return {
      isReady: RobonomicsProvider.isReady,
      title
    };
  }
};
</script>
