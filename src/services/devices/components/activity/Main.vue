<template>
  <div>
    <RCard class="section-centered">
      <div style="overflow: hidden">
        <h1 style="float: left">Telemetry</h1>
      </div>
      <SearchForm ref="form" :addr="id" @addr="handleForm" />
    </RCard>

    <div v-if="id" class="items">
      <RCard class="section-centered">
        <Pubsub :id="id" />
      </RCard>
      <RCard class="section-centered">
        <Polkadot :id="id" />
      </RCard>
    </div>
  </div>
</template>

<script>
import SearchForm from "./SearchForm";
import Pubsub from "./Pubsub";
import Polkadot from "./Polkadot";

export default {
  props: ["id"],
  components: {
    SearchForm,
    Pubsub,
    Polkadot
  },
  methods: {
    handleForm(name) {
      if (name !== this.id) {
        this.$router.push({ name: "iot-activity", params: { id: name } });
      }
    }
  }
};
</script>
