<template>
  <div>
    <h2>Register a thing</h2>
    <div>
      <p>
        A thing is the representation and record of your physical device in the
        cloud. Any physical device needs a thing to work with RWS IoT. Creating
        a thing will also create a thing shadow.
      </p>
      <div class="block-wiz">
        <form v-on:submit.prevent="submit">
          <RFormField>
            <RFieldLabel :isError="fields.name.error">Name</RFieldLabel>
            <input
              type="text"
              v-model="fields.name.value"
              class="container-full"
              :class="{ error: fields.name.error }"
            />
          </RFormField>
        </form>
      </div>
      <div class="nav-wiz">
        <button @click="$emit('prev')">Prev</button>
        <button @click="submit">Next</button>
      </div>
    </div>
  </div>
</template>

<script>
import robonomicsVC from "robonomics-vc";
import { storageDevices } from "../../utils/storage";

const list = storageDevices.getItems();

export default {
  props: ["name"],
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      fields: {
        name: {
          value: this.name,
          type: "text",
          rules: [
            "require",
            (v) => {
              return !Object.prototype.hasOwnProperty.call(list, v);
            }
          ],
          error: false
        }
      }
    };
  },
  created() {
    this.$on("onSubmit", this.onSubmit);
  },
  methods: {
    onSubmit(result) {
      if (!result.error) {
        this.$emit("next", { name: result.fields.name.value });
      }
    }
  }
};
</script>
