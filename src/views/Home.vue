<template>
  <Page>
    <h1>Robonomics Network</h1>
    <div class="flex-grid">
      <RCard style="text-align: center; font-size: 20px;">
        <router-link :to="{ name: 'services' }">Services</router-link>
      </RCard>
      <RCard style="text-align: center; font-size: 20px;">
        <router-link :to="{ name: 'telemetry' }">Telemetry</router-link>
      </RCard>
      <RCard style="text-align: center; font-size: 20px;">
        <router-link :to="{ name: 'uniswap' }">Buy XRT</router-link>
      </RCard>
    </div>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";

export default {
  components: {
    Page
  }
};
</script>
