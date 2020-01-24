<template>
  <fragment>
    <Info :address="address" :from="from" :to="to" />
    <Form :address="address" :from="from" :to="to" :initAmountWei="initAmountWei" />
  </fragment>
</template>

<script>
import token from "@/mixins/token";
import Info from "./Info";
import Form from "./Form";

export default {
  mixins: [token],
  props: {
    address: {},
    from: {},
    to: {},
    initAmountWei: {
      default: "0"
    }
  },
  components: {
    Info,
    Form
  },
  created() {
    this.watchToken(this.address, this.from, this.to);
  },
  watch: {
    address: function(newAddressl) {
      this.watchToken(newAddressl, this.from, this.to);
    }
  }
};
</script>
