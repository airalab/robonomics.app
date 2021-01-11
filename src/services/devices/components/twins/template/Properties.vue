<template>
  <table style="width: 100%">
    <thead v-if="title">
      <tr>
        <th colspan="2">{{ title }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="description">
        <td colspan="2">
          <small>{{ description }}</small>
        </td>
      </tr>
      <template v-if="schema.properties">
        <Property
          v-for="(prop, key) in Object.keys(schema.properties)"
          :schema="schema.properties[prop]"
          :data="data && data[prop] ? data[prop] : ''"
          :name="prop"
          :key="key"
        />
      </template>
    </tbody>
  </table>
</template>

<script>
import Property from "./Property";

export default {
  props: ["schema", "data"],
  components: { Property },
  computed: {
    title: function () {
      if (this.schema.title) {
        return this.schema.title;
      }
      return false;
    },
    description: function () {
      if (this.schema.description) {
        return this.schema.description;
      }
      return false;
    }
  }
};
</script>
