<template>
  <fragment>
    <Form
      v-if="ambix === ambix1"
      :token="from.address"
      :decimals="from.decimals"
      :fromLabel="from.label"
      :toLabel="to.label"
      :current="from.approve"
      :balance="from.balance"
      :ambix="ambix"
      :index="index"
    />
    <FormSimple
      v-else
      :token="from.address"
      :decimals="from.decimals"
      :fromLabel="from.label"
      :toLabel="to.label"
      :current="from.approve"
      :balance="from.balance"
      :ambix="ambix"
      :index="index"
    />
  </fragment>
</template>

<script>
import Form from "./Form";
import FormSimple from "./FormSimple";
import config from "../../config";

export default {
  props: ["from", "to", "ambix", "index"],
  components: {
    Form,
    FormSimple
  },
  data() {
    return {
      ambix1: config.AMBIX.AMBIX1
    };
  }
};
</script>
