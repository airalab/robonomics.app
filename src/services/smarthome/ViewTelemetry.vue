<template>
  <robo-section>
    <robo-title size="2">
      Your Telemetry
      <template #right>
        <robo-button outlined size="small" @click="save">
          Save json
        </robo-button>
      </template>
    </robo-title>
    <robo-template-telemetry :data="telemetry" />
  </robo-section>
</template>

<script>
import FileSaver from "file-saver";

export default {
  props: ["telemetry"],
  methods: {
    save() {
      var blob = new Blob([this.telemetry], {
        type: "text/plain;charset=utf-8"
      });
      FileSaver.saveAs(blob, "data.json");
    }
  }
};
</script>
