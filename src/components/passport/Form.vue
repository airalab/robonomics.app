<template>
  <form>
    <section>
      <div class="form-section-title">{{ $t("passport.subtitle1") }}</div>
      <div class="form-item form-line-label">
        <label for="inputdata-info">
          {{ $t("passport.emailField") }} *
          <span v-if="form.fields.email.error" class="input-msg">
            {{
            $t("passport.error")
            }}
          </span>
        </label>
        <input
          type="text"
          v-model="form.fields.email.value"
          class="container-full"
          :class="{ error: form.fields.email.error }"
          required
        />
      </div>
      <div class="form-item form-line-label">
        <label for="inputdata-info">
          {{ $t("passport.informations") }} *
          <span v-if="form.fields.info.error" class="input-msg">
            {{
            $t("passport.error")
            }}
          </span>
        </label>
        <textarea
          v-model="form.fields.info.value"
          class="container-full"
          :class="{ error: form.fields.info.error }"
          rows="2"
          required
        />
      </div>
    </section>
    <section>
      <div class="form-section-title">{{ $t("passport.subtitle2") }}</div>
      <div class="form-item form-line-label">
        <label for="inputdata-meta">
          {{ $t("passport.metaField") }} *
          <span v-if="form.fields.meta.error" class="input-msg">
            {{
            $t("passport.error")
            }}
          </span>
        </label>
        <file-pond
          name="meta"
          ref="pond"
          :label-idle="$t('passport.dragFile')"
          v-bind:server="upload"
          v-on:init="handleFilePondInit"
        />
      </div>
      <div class="form-item form-line-label">
        <label for="inputdata-images">
          {{ $t("passport.imagesField") }} *
          <span v-if="form.fields.images.error" class="input-msg">
            {{
            $t("passport.error")
            }}
          </span>
        </label>
        <div>
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
        </div>
      </div>
    </section>
  </form>
</template>

<script>
import vueFilePond from "vue-filepond";
import FilePondPluginFileEncode from "filepond-plugin-file-encode";
import "filepond/dist/filepond.min.css";

const FilePond = vueFilePond(FilePondPluginFileEncode);

export default {
  props: {
    onSubmit: {
      type: Function
    },
    isDisabled: {
      default: false
    }
  },
  components: {
    FilePond
  },
  data() {
    return {
      upload: {
        process: (fieldName, file, metadata, load, error, progress, abort) => {
          if (
            Object.prototype.hasOwnProperty.call(this.form.fields, fieldName) &&
            Object.prototype.hasOwnProperty.call(
              this.form.fields[fieldName],
              "value"
            )
          ) {
            this.form.fields[fieldName].value = file;
          } else {
            this.form.fields[fieldName].items[file.name] = file;
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
      form: {
        fields: {
          email: {
            value: "",
            type: "text",
            rules: ["require", "email"],
            error: false
          },
          info: {
            value: "",
            type: "text",
            rules: ["require"],
            error: false
          },
          meta: {
            value: "",
            type: "file",
            // rules: [],
            rules: ["require"],
            error: false
          },
          images: {
            items: {},
            type: "files",
            rules: ["items"],
            // rules: [],
            error: false
          }
        },
        error: false
      }
    };
  },
  methods: {
    validate() {
      this.form.error = false;
      for (let field in this.form.fields) {
        this.form.fields[field].error = false;
        this.form.fields[field].rules.forEach(rule => {
          if (rule === "require" && !this.form.fields[field].value) {
            this.form.fields[field].error = true;
            this.form.error = true;
          } else if (
            rule === "email" &&
            !/.+@.+/.test(this.form.fields[field].value)
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          } else if (
            rule === "items" &&
            Object.keys(this.form.fields[field].items).length === 0
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          }
        });
      }
      return !this.form.error;
    },
    handleFilePondInit() {
      console.log("FilePond has initialized");
    },
    removefile(a, file) {
      if (this.form.fields.images.items[file.filename]) {
        delete this.form.fields.images.items[file.filename];
      }
    },
    submit() {
      this.validate();
      if (this.onSubmit) {
        this.onSubmit(this.form.error, this.form.fields);
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
