<template>
  <fragment>
    <Header />
    <main role="main">
      <Sidebar />
      <RLayout>
        <slot />
      </RLayout>
    </main>
  </fragment>
</template>

<script>
import Header from "./header/Header";
import Sidebar from "./Sidebar";
import config from "~config";

export default {
  components: {
    Header,
    Sidebar
  },
  created() {
    if (this.$robonomics && this.$robonomics.account) {
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
