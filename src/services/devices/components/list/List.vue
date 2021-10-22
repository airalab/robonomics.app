<template>
  <RCard class="section-centered">
    <div style="overflow: hidden">
      <h1 style="float: left">Devices</h1>
      <div style="float: right">
        <router-link :to="{ name: 'iot-create' }" class="btn-small">
          Create thing
        </router-link>
      </div>
    </div>
    <table class="container-full table-hover">
      <tbody>
        <tr v-for="(item, name) in list" :key="name">
          <td>{{ name }}</td>
          <td>{{ item.platform }}</td>
          <td>{{ item.lang }}</td>
          <td style="text-align: right">
            <router-link
              :to="{ name: 'iot-activity', params: { id: name } }"
              class="btn-sm"
            >
              show
            </router-link>
            &nbsp;
            <button
              @click="remove(name)"
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
import { storageDevices, storageMsg } from "../../utils/storage";

export default {
  data() {
    return {
      list: {}
    };
  },
  mounted() {
    this.list = storageDevices.getItems();
  },
  methods: {
    remove(name) {
      storageDevices.removeItem(name);
      this.list = storageDevices.getItems();
      storageMsg.removeItem(name);
    }
  }
};
</script>
