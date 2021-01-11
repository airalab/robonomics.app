<template>
  <RCard class="section-centered">
    <div style="overflow: hidden">
      <h1 style="float: left">Digital twins</h1>
      <div style="float: right">
        <router-link :to="{ name: 'iot-twins-create' }" class="btn-small">
          Create digital twin
        </router-link>
      </div>
    </div>
    <table class="container-full table-hover">
      <tbody>
        <tr v-for="(_, acc) in list" :key="acc">
          <td>{{ acc }}</td>
          <td style="text-align: right">
            <router-link
              :to="{ name: 'iot-twin-show', params: { account: acc } }"
              class="btn-sm"
            >
              show
            </router-link>
            &nbsp;
            <button
              @click="remove(acc)"
              class="btn-sm"
              style="background-color: #f15a24"
            >
              remove
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </RCard>
</template>

<script>
import { storageTwins } from "../../utils/storage";

export default {
  data() {
    return {
      list: {}
    };
  },
  mounted() {
    this.list = storageTwins.getItems();
  },
  methods: {
    remove(name) {
      storageTwins.removeItem(name);
      this.list = storageTwins.getItems();
    }
  }
};
</script>
