<template>
  <form v-on:submit.prevent="submit">
    <RFormField>
      <RFieldLabel :isError="fields.address.error">
        Please, input smart contract address
      </RFieldLabel>
      <div class="input-measured container-full">
        <input
          v-model="fields.address.value"
          type="text"
          placeholder="0x0000000000000000000000000000000000000000"
          class="container-full"
          :class="{ error: fields.address.error }"
        />
      </div>
    </RFormField>
  </form>
</template>

<script>
import utils from "web3-utils";
import robonomicsVC from "robonomics-vc";

export default {
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      fields: {
        address: {
          value: "",
          type: "text",
          rules: [
            "require",
            (v) => {
              return utils.isAddress(v);
            }
          ],
          error: false
        }
      }
    };
  }
};
</script>
