<template>
  <Page>
    <section class="section-light section-centered">
      <h2>Approve token</h2>
      <section>
        <div class="form-item form-line-label">
          <label for="inputdata-token">
            Address token *
            <span
              v-if="form.fields.token.error"
              class="input-msg"
            >Check if data correct, please.</span>
          </label>
          <input
            v-model="form.fields.token.value"
            class="container-full"
            :class="{ error: form.fields.token.error }"
            type="text"
            required
          />
        </div>
      </section>
      <section>
        <div class="form-item form-line-label">
          <label for="inputdata-toApprove">
            Address to approve *
            <span
              v-if="form.fields.toApprove.error"
              class="input-msg"
            >Check if data correct, please.</span>
          </label>
          <input
            v-model="form.fields.toApprove.value"
            class="container-full"
            :class="{ error: form.fields.toApprove.error }"
            type="text"
            required
          />
        </div>
      </section>

      <Approve
        v-if="!form.error"
        :address="form.fields.token.value"
        :from="$robonomics.account.address"
        :to="form.fields.toApprove.value"
        initAmountWei="1"
      />
    </section>
  </Page>
</template>

<script>
import Page from "@/components/Page";
import Approve from "@/components/approve/Main";

export default {
  props: ["passport"],
  components: {
    Page,
    Approve
  },
  data() {
    return {
      form: {
        fields: {
          token: {
            value: "",
            rules: ["require", "address"],
            error: true
          },
          toApprove: {
            value: "",
            rules: ["require", "address"],
            error: true
          }
        },
        error: true
      }
    };
  },
  created() {
    this.$robonomics.ready().then(() => {
      this.form.fields.token.value = this.$robonomics.xrt.address;
      this.form.fields.toApprove.value = this.$robonomics.factory.address;
      this.validate();
    });
  },
  watch: {
    "form.fields.token.value": {
      handler(value, oldValue) {
        if (value !== oldValue) {
          this.validate();
        }
      },
      deep: true
    },
    "form.fields.toApprove.value": {
      handler(value, oldValue) {
        if (value !== oldValue) {
          this.validate();
        }
      },
      deep: true
    }
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
            rule === "address" &&
            !this.$robonomics.web3.utils.isAddress(
              this.form.fields[field].value
            )
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          }
        });
      }
      return !this.form.error;
    }
  }
};
</script>
