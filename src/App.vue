<template>
  <main-layout :pagetitle="title">
    <router-view />
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
    // const IpfsProvider = inject("IpfsProvider");
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const title = ref();

    // store.commit("rws/setKey", process.env.VUE_APP_ROBONOMICS_UI_KEY);
    // отказываемся от этой переменной совсем
    // store.dispatch("rws/init");

    store.commit("rws/setLink", {
      link: "activate",
      value: router.resolve({ name: "rwsActivate" }).path
    });

    store.commit("rws/setLink", {
      link: "setup",
      value: router.resolve({ name: "rwsSetup" }).path
    });

    store.commit("rws/setLink", {
      link: "setupnew",
      value: router.resolve({ name: "rwsSetupNew" }).path
    });

    store.commit("rws/setLink", {
      link: "devices",
      value: router.resolve({ name: "telemetry" }).path
    });
    
    watch(route, () => {
      title.value = route?.meta?.title;
      const resulttitle = title.value
        ? `${title.value} / Robonomics Dapp`
        : "Robonomics Dapp";
      document.title = resulttitle;
      if(document
      .querySelector('meta[property="og:title"]'))
      document
        .querySelector('meta[property="og:title"]')
        .setAttribute("content", resulttitle);
    });

    watch(
      [route, RobonomicsProvider.isReady],
      ([route, isReady]) => {
        if (route.name !== "telemetry" && isReady) {
          store.commit("polkadot/setConnectionType", "parachain");
          store.commit("polkadot/setConnectionConnected", true);
        }
      },
      { immediate: true }
    );

    return {
      title
    };
  }
};
</script>
