<template>
  <form v-on:submit.prevent="submit">
    <RFormSection :title="$t('sensorSelect.subtitle')">
      <RFormField>
        <RFieldLabel :isError="fields.lighthouse.error">{{
          $t("sensorSelect.form.lighthouse")
        }}</RFieldLabel>
        <input
          type="text"
          v-model="fields.lighthouse.value"
          class="container-full"
          :class="{ error: fields.lighthouse.error }"
        />
      </RFormField>
      <RFormField>
        <RFieldLabel :isError="fields.model.error">{{
          $t("sensorSelect.form.model")
        }}</RFieldLabel>
        <input
          type="text"
          v-model="fields.model.value"
          class="container-full"
          :class="{ error: fields.model.error }"
        />
      </RFormField>
      <RFormField>
        <RFieldLabel :isError="fields.agent.error">{{
          $t("sensorSelect.form.agent")
        }}</RFieldLabel>
        <input
          type="text"
          v-model="fields.agent.value"
          class="container-full"
          :class="{ error: fields.agent.error }"
        />
      </RFormField>
    </RFormSection>

    <button class="container-full btn-big">
      {{ $t("sensorSelect.btn") }}
    </button>
  </form>
</template>

<script>
import robonomicsVC from "robonomics-vc";

export default {
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      fields: {
        lighthouse: {
          value: "airalab",
          type: "text",
          rules: ["require"],
          error: false
        },
        model: {
          value: "QmWjvXGfVUDBNR15BBH5ERGP3SzEKbeLZWx7Fcp4kwwaw9",
          type: "text",
          rules: ["require", "hashIpfs"],
          error: false
        },
        agent: {
          value: "",
          type: "text",
          rules: ["require", robonomicsVC.validators.length(42)],
          error: false
        }
      }
    };
  }
};
</script>
