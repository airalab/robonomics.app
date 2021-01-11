<template>
  <tr>
    <td colspan="2" v-if="schema.type === 'Object'">
      <Properties :schema="schema" :data="data" />
    </td>
    <template v-else>
      <td style="width: 20%">{{ title }}:</td>
      <td>
        {{ value }}
      </td>
    </template>
  </tr>
</template>

<script>
export default {
  props: ["schema", "data", "name"],
  components: { Properties: () => import("./Properties") },
  computed: {
    title: function () {
      if (this.schema.title) {
        return this.schema.title;
      } else {
        return this.name;
      }
    },
    value: function () {
      let value = "";
      if (this.data) {
        let type = "String";
        if (this.schema.type) {
          type = this.schema.type;
        }
        if (type === "String") {
          value = String(this.data);
        }
        if (type === "Number") {
          value = Number(this.data);
        }
        if (type === "Boolean") {
          value = Boolean(this.data);
        }
        if (type === "Datatime") {
          value = new Date(
            Number(
              `${this.data}${this.data.toString().length === 10 ? "000" : ""}`
            )
          ).toLocaleString();
        }
        if (this.schema.unit) {
          value = `${value} ${this.schema.unit}`;
        }
      }
      return value;
    }
  }
};
</script>
