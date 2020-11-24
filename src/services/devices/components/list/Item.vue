<template>
  <RCard class="section-centered">
    <div style="overflow: hidden">
      <h1 style="float: left">Thing {{ id }}</h1>
      <div style="float: right">
        <router-link :to="{ name: 'iot-devices' }"> back to list </router-link>
      </div>
    </div>

    <template v-if="platform">
      <p>
        Platform: <b>{{ platform }}</b>
      </p>
      <p>
        Language: <b>{{ lang }}</b>
      </p>
      <div style="text-align: right">
        <button @click="push" class="btn-sm">test push</button>
      </div>
      <div
        style="
          height: 200px;
          overflow-x: scroll;
          background: #fff;
          padding: 10px;
          font-size: 12px;
          border: 1px solid #eee;
        "
      >
        <p v-for="(item, k) in log" :key="k">{{ item }}</p>
      </div>
    </template>
    <template v-if="error">
      <p>{{ error }}</p>
    </template>
  </RCard>
</template>

<script>
import { storageDevices } from "../../utils/storage";

export default {
  props: ["id"],
  data() {
    return {
      error: "",
      platform: "",
      lang: "",
      log: []
    };
  },
  mounted() {
    const list = storageDevices.getItems();
    if (Object.prototype.hasOwnProperty.call(list, this.id)) {
      const { platform, lang } = list[this.id];
      this.platform = platform;
      this.lang = lang;
      this.log = [];

      this.$ipfs.pubsub.subscribe(
        "airalab.lighthouse.5.robonomics.eth",
        (r) => {
          // this.log.unshift(r.data.toString());
          try {
            const data = JSON.parse(r.data.toString());
            if (data.time && data.id === this.id) {
              this.log.unshift(r.data.toString());
            }
          } catch (error) {
            console.log(r.data.toString());
          }
        }
      );
    } else {
      this.error = "not found";
    }
  },
  methods: {
    push() {
      this.$ipfs.pubsub.publish(
        "airalab.lighthouse.5.robonomics.eth",
        JSON.stringify({ time: Date.now(), id: this.id, type: "web" })
      );
    }
  }
};
</script>
