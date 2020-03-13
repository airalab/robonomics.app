<template>
  <Page>
    <section class="section-light section-centered">
      <h2>{{ $t("sensorSelect.title") }}</h2>
      <Form ref="form" :onSubmit="onSubmit" />
      <button class="container-full btn-big" @click="open">{{ $t("sensorSelect.btn") }}</button>
    </section>
  </Page>
</template>

<script>
import Page from "@/components/Page";
import Form from "./Form";

export default {
  data() {
    return {
      response: null
    };
  },
  components: {
    Page,
    Form
  },
  methods: {
    open() {
      this.$refs.form.submit();
    },
    onSubmit(e, fields) {
      if (!e) {
        this.$router.push({
          name: "sensor",
          params: {
            lighthouse: fields.lighthouse.value,
            model: fields.model.value,
            agent: fields.agent.value
          }
        });
      }
    }
  }
};
</script>
