<template>
  <Page>
    <section class="section-light section-centered">
      <h2>{{ $t("sensorSelect.title") }}</h2>
      <Form @onSubmit="handleSubmit" />
    </section>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
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
    handleSubmit({ error, fields }) {
      if (!error) {
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
