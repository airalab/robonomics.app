<template>
  <form v-on:submit.prevent="submit">
    <RFormSection :title="$t('passport.subtitle1')">
      <RFormField>
        <RFieldLabel :isError="fields.email.error">{{
          $t("passport.emailField")
        }}</RFieldLabel>
        <input
          type="text"
          v-model="fields.email.value"
          class="container-full"
          :class="{ error: fields.email.error }"
        />
      </RFormField>
      <RFormField>
        <RFieldLabel :isError="fields.info.error">{{
          $t("passport.informations")
        }}</RFieldLabel>
        <textarea
          v-model="fields.info.value"
          class="container-full"
          :class="{ error: fields.info.error }"
          rows="2"
          required
        />
      </RFormField>
    </RFormSection>
    <RFormSection :title="$t('passport.subtitle2')">
      <RFormField>
        <RFieldLabel :isError="fields.meta.error">{{
          $t("passport.metaField")
        }}</RFieldLabel>
        <file-pond
          name="meta"
          ref="pond"
          :label-idle="$t('passport.dragFile')"
          v-bind:server="upload"
          v-on:init="handleFilePondInit"
        />
      </RFormField>
      <RFormField>
        <RFieldLabel :isError="fields.images.error">{{
          $t("passport.imagesField")
        }}</RFieldLabel>
        <file-pond
          name="images"
          ref="pond"
          allow-multiple="true"
          accepted-file-types="image/jpeg, image/png"
          :label-idle="$t('passport.dragImages')"
          v-bind:server="upload"
          v-on:init="handleFilePondInit"
          v-on:removefile="removefile"
        />
      </RFormField>
    </RFormSection>
  </form>
</template>

<script>
import robonomicsVC from "robonomics-vc";
import vueFilePond from "vue-filepond";
import FilePondPluginFileEncode from "filepond-plugin-file-encode";
import "filepond/dist/filepond.min.css";

const FilePond = vueFilePond(FilePondPluginFileEncode);

export default {
  mixins: [robonomicsVC.mixins.form],
  components: {
    FilePond
  },
  data() {
    return {
      upload: {
        process: (fieldName, file, metadata, load, error, progress, abort) => {
          if (
            Object.prototype.hasOwnProperty.call(this.fields, fieldName) &&
            Object.prototype.hasOwnProperty.call(
              this.fields[fieldName],
              "value"
            )
          ) {
            this.fields[fieldName].value = file;
          } else {
            this.fields[fieldName].items[file.name] = file;
          }
          load();
          return {
            abort: () => {
              abort();
            }
          };
        },
        revert: null
      },
      fields: {
        email: {
          value: "",
          type: "text",
          rules: [
            function (v) {
              return /\S+@\S+\.\S+/.test(v);
            }
          ],
          error: false
        },
        info: {
          value: "",
          type: "text",
          rules: [],
          error: false
        },
        meta: {
          value: "",
          type: "file",
          rules: ["require"],
          error: false
        },
        images: {
          items: {},
          type: "files",
          rules: [],
          error: false
        }
      }
    };
  },
  methods: {
    handleFilePondInit() {
      console.log("FilePond has initialized");
    },
    removefile(a, file) {
      if (this.fields.images.items[file.filename]) {
        delete this.fields.images.items[file.filename];
      }
    }
  }
};
</script>

<style>
.theme-light [data-filepond-item-state="processing-complete"] .filepond--file {
  color: white;
}
</style>
