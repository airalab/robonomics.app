<template>
  <p>
    <span class="t-sm">Withdraw from lighthouse:</span>
    <br />
    <input
      class="input-size--sm m-r-10 input-sm"
      type="text"
      v-model="count"
      @input="
        count = Number($event.target.value);
        validate();
      "
      min="1"
    />
    <RButton
      @click.native="sendWithdraw"
      :disabled="withdraw.disabled"
      class="btn-blue input-sm"
      >{{ withdraw.text }}</RButton
    >
  </p>
</template>

<script>
export default {
  data() {
    return {
      minimalStake: 0,
      countMax: 0,
      count: 0,
      withdraw: {
        disabled: true,
        text: "Withdraw"
      }
    };
  },
  mounted() {
    this.$robonomics.lighthouse.methods
      .minimalStake()
      .call()
      .then(r => {
        this.minimalStake = Number(r);
      });
    return this.fetchData();
  },
  methods: {
    validate() {
      if (this.count > 0 && this.count <= this.countMax) {
        this.withdraw.disabled = false;
      } else {
        this.withdraw.disabled = true;
      }
    },
    fetchData() {
      return this.$robonomics.lighthouse.methods
        .stakes(this.$robonomics.account.address)
        .call()
        .then(stake => {
          if (stake > 0) {
            this.countMax = Number(stake) / this.minimalStake;
            this.withdraw.disabled = false;
          } else {
            this.countMax = 0;
            this.withdraw.disabled = true;
          }
          this.count = this.countMax;
        });
    },
    sendWithdraw() {
      this.withdraw.disabled = true;
      this.withdraw.text = "...";
      return this.$robonomics.lighthouse.methods
        .withdraw(this.minimalStake * this.count)
        .send({
          from: this.$robonomics.account.address
        })
        .then(() => {
          this.withdraw.text = "Ok";
          this.withdraw.disabled = false;
          this.$store.dispatch("providers/fetchData");
        })
        .then(() => this.fetchData())
        .catch(() => {
          this.withdraw.text = "Withdraw";
          this.withdraw.disabled = false;
        });
    }
  }
};
</script>
