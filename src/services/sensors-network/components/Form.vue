<template>
  <form>
    <section>
      <div class="form-section-title">{{ $t("sensorSelect.subtitle") }}</div>
      <div class="form-item form-line-label">
        <label for="inputdata-lighthouse">
          {{ $t("sensorSelect.form.lighthouse") }}
          <span
            v-if="form.fields.lighthouse.error"
            class="input-msg"
          >
            {{
            $t("sensorSelect.form.error")
            }}
          </span>
        </label>
        <input
          type="text"
          v-model="form.fields.lighthouse.value"
          class="container-full"
          :class="{ error: form.fields.lighthouse.error }"
          required
        />
      </div>
      <div class="form-item form-line-label">
        <label for="inputdata-model">
          {{ $t("sensorSelect.form.model") }}
          <span v-if="form.fields.model.error" class="input-msg">
            {{
            $t("sensorSelect.form.error")
            }}
          </span>
        </label>
        <input
          type="text"
          v-model="form.fields.model.value"
          class="container-full"
          :class="{ error: form.fields.model.error }"
          required
        />
      </div>
      <div class="form-item form-line-label">
        <label for="inputdata-agent">
          {{ $t("sensorSelect.form.agent") }}
          <span v-if="form.fields.agent.error" class="input-msg">
            {{
            $t("sensorSelect.form.error")
            }}
          </span>
        </label>
        <input
          type="text"
          v-model="form.fields.agent.value"
          class="container-full"
          :class="{ error: form.fields.agent.error }"
          required
        />
      </div>
    </section>
  </form>
</template>

<script>
export default {
  props: {
    onSubmit: {
      type: Function
    },
    isDisabled: {
      default: false
    }
  },
  data() {
    return {
      form: {
        fields: {
          lighthouse: {
            value: "airalab",
            type: "text",
            rules: ["require"],
            error: false
          },
          model: {
            value: "QmWjvXGfVUDBNR15BBH5ERGP3SzEKbeLZWx7Fcp4kwwaw9",
            type: "text",
            rules: ["require"],
            error: false
          },
          agent: {
            value: "",
            type: "text",
            rules: ["require"],
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
          }
        });
      }
      return !this.form.error;
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
