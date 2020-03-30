<template>
  <input
    v-model="form.fields.amount.value"
    :class="{ error: form.fields.amount.error }"
    type="text"
    required
  />
</template>

<script>
import { number } from "../../utils/tools";

export default {
  props: {
    onSubmit: {
      type: Function
    },
    onChange: {
      type: Function
    },
    initAmountWei: {
      default: "0"
    },
    maxAmountWei: {
      default: "0"
    },
    decimals: {
      default: "0"
    }
  },
  watch: {
    "form.fields.amount.value": {
      handler(value, oldValue) {
        if (value !== oldValue) {
          if (this.onChange) {
            this.onChange(this.form.fields);
          }
        }
      },
      deep: true
    },
    decimals: function(newValue, old) {
      if (newValue !== old) {
        this.form.fields.amount.value = number.fromWei(
          this.initAmountWei,
          this.decimals
        );
      }
    }
  },
  data() {
    return {
      form: {
        fields: {
          amount: {
            value: number.fromWei(this.initAmountWei, this.decimals),
            rules: ["require", "number", "min", "max"],
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
            rule === "number" &&
            isNaN(Number(this.form.fields[field].value))
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          } else if (
            rule === "min" &&
            Number(number.toWei(this.form.fields[field].value, this.decimals)) <
              1
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          } else if (
            rule === "max" &&
            Number(number.toWei(this.form.fields[field].value, this.decimals)) >
              Number(this.maxAmountWei)
          ) {
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
