<template>
  <Page>
    <section class="section-light section-centered">
      <h2>Liability</h2>
      <section>
        <div class="form-section-title">{{ liability }}</div>
        <div class="form-item form-line-label">
          <label>lighthouse</label>
          <div>{{ lighthouse }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>model</label>
          <div>{{ model }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>objective</label>
          <div>{{ objective }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>promisor</label>
          <div>{{ promisor }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>promisee</label>
          <div>{{ promisee }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>token</label>
          <div>{{ token }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>cost</label>
          <div>{{ cost }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>result</label>
          <div>{{ result }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>lighthouseFee</label>
          <div>{{ lighthouseFee }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>validator</label>
          <div>{{ validator }}</div>
        </div>
        <div class="form-item form-line-label">
          <label>validatorFee</label>
          <div>{{ validatorFee }}</div>
        </div>
      </section>
    </section>
  </Page>
</template>

<script>
import { Liability } from "robonomics-js";
import Page from "@/components/layout/Page";

export default {
  props: ["liability"],
  data() {
    return {
      model: "",
      objective: "",
      result: "",
      token: "",
      cost: 0,
      lighthouseFee: 0,
      validatorFee: 0,
      promisor: "",
      promisee: "",
      lighthouse: "",
      validator: ""
    };
  },
  components: {
    Page
  },
  created() {
    // 0x46cba2de944ee7bb9f951f1157ae04d0ddd9ed85
    this.contarct = new Liability(this.$robonomics.web3, this.liability);
    this.contarct.getInfo().then((r) => {
      this.model = r.model;
      this.objective = r.objective;
      this.result = r.result;
      this.token = r.token;
      this.cost = r.cost;
      this.lighthouseFee = r.lighthouseFee;
      this.validatorFee = r.validatorFee;
      this.promisor = r.promisor;
      this.promisee = r.promisee;
      this.lighthouse = r.lighthouse;
      this.validator = r.validator;
    });
  }
};
</script>
