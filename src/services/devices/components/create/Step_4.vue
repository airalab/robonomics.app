<template>
  <div>
    <h2>Download a connection kit</h2>
    <div>
      <p>
        A thing is the representation and record of your physical device in the
        cloud. Any physical device needs a thing to work with RWS IoT. Creating
        a thing will also create a thing shadow.
      </p>
      <div class="block-wiz">
        <h3>The following RWS IoT resources will be created:</h3>
        <table>
          <tbody>
            <tr>
              <td>A thing in the RWS IoT registry</td>
              <td>{{ name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="block-wiz">
        <h3>The connection kit contains:</h3>
        <table>
          <tbody>
            <tr>
              <td>RWS IoT Device SDK</td>
              <td>{{ lang }}</td>
            </tr>
            <tr>
              <td>A script to send and receive messages</td>
              <td>start.sh</td>
            </tr>
          </tbody>
        </table>
        <p>
          Before your device can connect and publish messages, you will need to
          download the connection kit.
        </p>
      </div>
      <div class="nav-wiz">
        <button @click="$emit('prev')">Prev</button>
        <button @click="download">Download connection kit for</button>
      </div>
    </div>
  </div>
</template>

<script>
import JSZip from "jszip";
import { saveAs } from "file-saver";
import axios from "axios";

export default {
  props: ["platform", "lang", "name"],
  methods: {
    async download() {
      if (this.lang === "python") {
        const zip = new JSZip();
        const defaultFile = (
          await axios.get(
            "https://raw.githubusercontent.com/tubleronchik/rws/main/docker/start.sh"
          )
        ).data;
        const newFile = defaultFile.replaceAll(
          'DEVICE_ID=""',
          `DEVICE_ID="${this.name}"`
        );
        zip.file("start.sh", newFile);
        zip.generateAsync({ type: "blob" }).then((content) => {
          saveAs(content, "connect_device_package.zip");
          this.$emit("next");
        });
      } else if (this.lang === "nodejs") {
        const zip = new JSZip();
        const defaultFile = (
          await axios.get("/examples_connect_device/nodejs.zip", {
            responseType: "blob"
          })
        ).data;
        await zip.loadAsync(defaultFile);
        const file = await zip.file("config.json").async("string");
        const newFile = file.replaceAll("DEVICE_NAME", this.name);
        zip.file("config.json", newFile);
        zip.generateAsync({ type: "blob" }).then((content) => {
          saveAs(content, "connect_device_package.zip");
          this.$emit("next");
        });
      }
    }
  }
};
</script>
