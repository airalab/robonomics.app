<template>
  <fragment>
    <p>
      <span class="t-sm">Available for work at the lighthouse:</span>
      <br />
      <b>{{ approveWorker.value | fromWei(9, 'XRT') }}</b>
    </p>
    <hr />
    <p>
      <span class="t-sm">Available for work:</span>
      <br />
      <input
        class="input-size--sm m-r-10 input-sm"
        type="text"
        v-model="count"
        @input="count = Number($event.target.value);validate()"
        min="1"
      />
      <RButton
        @click.native="sendApproveWorker"
        v-if="approveWorker.show"
        :disabled="approveWorker.disabled"
        class="btn-blue input-sm"
      >{{ approveWorker.text }}</RButton>
      <RButton
        @click.native="sendRefill"
        v-if="refill.show"
        :disabled="refill.disabled"
        class="btn-blue input-sm"
      >{{ refill.text }}</RButton>
    </p>
  </fragment>
</template>

<script>
import { Promise } from "bluebird";

export default {
  data() {
    return {
      minimalStake: 1000,
      count: 1,
      approveWorker: {
        value: 0,
        show: true,
        disabled: true,
        text: "Approve quotes"
      },
      refill: {
        show: false,
        disabled: false,
        text: "Refill"
      }
    };
  },
  mounted() {
    return this.fetchData();
  },
  methods: {
    validate() {
      if (this.approveWorker.value >= this.minimalStake * this.count) {
        this.refill.show = true;
        this.approveWorker.show = false;
      } else {
        this.refill.show = false;
        this.approveWorker.show = true;
        this.approveWorker.disabled = false;
        this.approveWorker.text = "Approve quotes";
      }
    },
    fetchData() {
      return this.$robonomics.lighthouse.call
        .minimalStake()
        .then(r => {
          this.minimalStake = Number(r);
          return this.$robonomics.xrt.call.balanceOf(
            this.$robonomics.account.address
          );
        })
        .then(balanceOf => {
          const calls = [];
          if (balanceOf >= this.minimalStake * this.count) {
            calls.push(
              this.$robonomics.xrt.call
                .allowance(
                  this.$robonomics.account.address,
                  this.$robonomics.lighthouse.address
                )
                .then(allowance => {
                  this.approveWorker.value = allowance;
                  this.count = Math.floor(
                    this.approveWorker.value / this.minimalStake
                  );
                  if (allowance >= this.minimalStake * this.count) {
                    this.approveWorker.show = false;
                    this.approveWorker.disabled = true;
                    this.approveWorker.text = "Approved";

                    this.refill.show = true;
                    this.refill.disabled = false;
                    this.refill.text = "Refill";
                  } else {
                    this.approveWorker.show = true;
                    this.approveWorker.disabled = false;
                    this.approveWorker.text = "Approve quotes";

                    this.refill.show = false;
                    this.refill.disabled = true;
                    this.refill.text = "Refill";
                  }
                })
            );
          } else {
            this.approveWorker.disabled = true;
            this.approveWorker.text = "Approve quotes";
          }
          return Promise.all(calls);
        });
    },
    sendApproveWorker() {
      this.approveWorker.disabled = true;
      this.approveWorker.text = "...";
      return this.$robonomics.xrt.send
        .approve(
          this.$robonomics.lighthouse.address,
          this.minimalStake * this.count,
          {
            from: this.$robonomics.account.address
          }
        )
        .then(() => {
          this.approveWorker.text = "Approved";
          this.approveWorker.false = true;
          return this.fetchData();
        })
        .catch(() => {
          this.approveWorker.text = "Approve quotes";
          this.approveWorker.false = true;
        });
    },
    sendRefill() {
      this.refill.disabled = true;
      this.refill.text = "...";
      return this.$robonomics.lighthouse.send
        .refill(this.minimalStake * this.count, {
          from: this.$robonomics.account.address
        })
        .then(() => {
          this.refill.text = "Ok";
          this.refill.disabled = false;
          this.$store.dispatch("providers/fetchData");
        })
        .then(() => this.fetchData())
        .catch(() => {
          this.refill.text = "Refill";
          this.refill.disabled = false;
        });
    }
  }
};
</script>
