<template>
  <fragment>
    <Header />
    <main role="main">
      <Sidebar />
      <RLayout>
        <slot />
        <Status />
      </RLayout>
    </main>
  </fragment>
</template>

<script>
import Header from "./Header";
import Sidebar from "./Sidebar";
import Status from "../Status";
import config from "~config";

export default {
  components: {
    Header,
    Sidebar,
    Status
  },
  created() {
    if (this.$robonomics.account) {
      Object.values(config.chain.get().TOKEN).forEach((item) => {
        this.$store.dispatch("tokens/add", item.address);
        this.$store.dispatch("tokens/watchBalance", {
          token: item.address,
          account: this.$robonomics.account.address
        });
      });
    }
  }
};
</script>
