<template>
  <Page>
    <RCard class="section-centered">
      <h2>Robonomics Web Services dashboard</h2>
      <template v-if="isApi">
        <router-view v-if="$robonomics.account"></router-view>
        <RButton v-else @click="$store.dispatch('chain/accessAccount', false)">
          Connect ethereum account
        </RButton>
      </template>
      <template v-else>
        <div v-if="error" class="red">{{ error }}</div>
        <div v-else>...</div>
      </template>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import { Robonomics } from "@/utils/robonomics-substrate";
import { createInstance } from "@/utils/substrate";

export default {
  components: {
    Page
  },
  data() {
    return {
      error: null,
      isApi: false
    };
  },
  async created() {
    try {
      this.robonomics = Robonomics.getInstance();
      this.isApi = true;
    } catch (_) {
      try {
        this.robonomics = await createInstance();
        this.isApi = true;
      } catch (error) {
        this.error = error.message;
      }
    }
  }
};
</script>
