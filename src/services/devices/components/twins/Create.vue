<template>
  <RCard class="section-centered">
    <h1>Create digital twin</h1>
    <div>
      <div class="block-wiz">
        <form v-on:submit.prevent="submit">
          <RFormField>
            <RFieldLabel :isError="fields.account.error">account</RFieldLabel>
            <input
              type="text"
              v-model="fields.account.value"
              class="container-full"
              :class="{ error: fields.account.error }"
            />
          </RFormField>
          <RFormField>
            <RFieldLabel :isError="fields.template.error">template</RFieldLabel>
            <select
              v-model="template"
              @change="selectTemplate"
              class="container-full"
            >
              <option value="">custom</option>
              <option value="1">hello</option>
              <option value="2">sds011</option>
              <option value="3">water</option>
            </select>
            <prism-editor
              v-model="fields.template.value"
              :highlight="highlighter"
              line-numbers
            ></prism-editor>
            <!-- <textarea
              v-model="fields.template.value"
              class="container-full"
              :class="{ error: fields.template.error }"
              style="height: 200px"
            /> -->
          </RFormField>
        </form>
      </div>
      <div class="nav-wiz">
        <button @click="submit" :disabled="process">Save</button>
        <template v-if="success">
          <span>Saved</span>
        </template>
      </div>
    </div>
  </RCard>
</template>

<script>
import robonomicsVC from "robonomics-vc";
import JSON5 from "json5";
import { checkAddress } from "@polkadot/util-crypto";
import { storageTwins } from "../../utils/storage";

import { PrismEditor } from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css";
import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import { Robonomics } from "@/utils/robonomics-substrate";

const list = storageTwins.getItems();

export default {
  mixins: [robonomicsVC.mixins.form],
  components: {
    PrismEditor
  },
  data() {
    return {
      process: false,
      success: false,
      template: "",
      fields: {
        account: {
          value: "",
          type: "text",
          rules: [
            "require",
            robonomicsVC.validators.length(48),
            (v) => {
              return checkAddress(
                v,
                Robonomics.getInstance().api.registry.chainSS58
              )[0];
            },
            (v) => {
              return !Object.prototype.hasOwnProperty.call(list, v);
            }
          ],
          error: false
        },
        template: {
          value: "{}",
          type: "textarea",
          rules: [
            "require",
            (v) => {
              try {
                JSON5.parse(v);
              } catch (error) {
                return false;
              }
              return true;
            }
          ],
          error: false
        }
      }
    };
  },
  created() {
    this.$on("onSubmit", this.onSubmit);
    this.selectTemplate();
  },
  methods: {
    highlighter(code) {
      return highlight(code, languages.js); //returns html
    },
    selectTemplate() {
      let value = "{}";
      // this.custom = this.fields.template.value;
      if (this.template === "1") {
        value =
          '{"title":"Hello","type":"Object","properties":{"id":{"type":"String","title":"ID"},"type":{"type":"String","title":"Type"},"time":{"type":"Datatime","title":"Date"}}}';
      } else if (this.template === "2") {
        value =
          '{"title":"Sds011","type":"Object","properties":{"pubkey":{"type":"String","title":"Public key"},"timestamp":{"type":"Datatime","title":"Date"},"measurement":{"title":"Measurement","type":"Object","properties":{"pm25":{"type":"Number","title":"pm25"},"pm10":{"type":"Number","title":"pm10"},"geo":{"type":"String","title":"Geo position"}}}}}';
      } else if (this.template === "3") {
        value =
          '{"title":"Waterdrone","description":"Desc","type":"Object","properties":{"time":{"type":"Datatime","title":"Date"},"Lat":{"type":"Number","title":"Position lat"},"Lon":{"type":"Number","title":"Position lon"},"temp":{"type":"Number","title":"Температура","unit":"C"},"pH":{"type":"Number","title":"pH"},"cond":{"type":"Number","title":"Сond"}}}';
      }
      this.fields.template.value = JSON.stringify(JSON.parse(value), null, 4);
    },
    onSubmit(result) {
      this.process = true;
      if (!result.error) {
        storageTwins.addItem(
          result.fields.account.value,
          JSON.stringify(JSON5.parse(result.fields.template.value))
        );
        this.success = true;
      } else {
        this.process = false;
      }
    }
  }
};
</script>
