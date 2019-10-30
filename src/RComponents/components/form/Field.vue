<template>
  <FieldItem>
    <Label
      v-if="label"
      :for="forLabel ? forLabel : `field_${_uid}`"
      :label="label"
      :isError="isError"
      :msgError="msgError"
    />
    <slot :id="`field_${_uid}`" />
  </FieldItem>
</template>

<script>
import FieldItem from "./FieldItem";
import Label from "./Label";

export default {
  props: {
    label: String,
    forLabel: String,
    msgError: {
      type: String,
      default: "Check if data correct, please."
    },
    isError: {
      type: Boolean,
      default: false
    }
  },
  components: {
    FieldItem,
    Label
  }
};
</script>
