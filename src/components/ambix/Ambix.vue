<template>
  <Form
    :token="from.address"
    :decimals="from.decimals"
    :fromLabel="from.label"
    :toLabel="to.label"
    :current="from.approve"
    :ambix="ambix"
    :index="index"
  />
</template>

<script>
import Form from "./Form";

export default {
  props: ["from", "to", "ambix", "index"],
  components: {
    Form
  }
};
</script>
