<template>
  <fragment>
    <p>
      <span class="t-sm">{{ $t("lighthouse.approve.value") }}:</span>
      <br />
      <b>{{ approveWorker.value | fromWei(9, "XRT") }}</b>
    </p>
    <hr />
    <p>
      <span class="t-sm">{{ $t("lighthouse.approve.count") }}:</span>
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
        text: this.$t("lighthouse.approve.quotes")
      },
      refill: {
        show: false,
        disabled: false,
        text: this.$t("lighthouse.approve.refill")
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
        this.approveWorker.text = this.$t("lighthouse.approve.quotes");
      }
    },
    fetchData() {
      return this.$robonomics.lighthouse.methods
        .minimalStake()
        .call()
        .then(r => {
          this.minimalStake = Number(r);
          return this.$robonomics.xrt.methods
            .balanceOf(this.$robonomics.account.address)
            .call();
        })
        .then(balanceOf => {
          const calls = [];
          if (balanceOf >= this.minimalStake * this.count) {
            calls.push(
              this.$robonomics.xrt.methods
                .allowance(
                  this.$robonomics.account.address,
                  this.$robonomics.lighthouse.address
                )
                .call()
                .then(allowance => {
                  this.approveWorker.value = allowance;
                  this.count = Math.floor(
                    this.approveWorker.value / this.minimalStake
                  );
                  if (allowance >= this.minimalStake * this.count) {
                    this.approveWorker.show = false;
                    this.approveWorker.disabled = true;
                    this.approveWorker.text = this.$t(
                      "lighthouse.approve.approved"
                    );

                    this.refill.show = true;
                    this.refill.disabled = false;
                    this.refill.text = this.$t("lighthouse.approve.refill");
                  } else {
                    this.approveWorker.show = true;
                    this.approveWorker.disabled = false;
                    this.approveWorker.text = this.$t(
                      "lighthouse.approve.quotes"
                    );

                    this.refill.show = false;
                    this.refill.disabled = true;
                    this.refill.text = this.$t("lighthouse.approve.refill");
                  }
                })
            );
          } else {
            this.approveWorker.disabled = true;
            this.approveWorker.text = this.$t("lighthouse.approve.quotes");
          }
          return Promise.all(calls);
        });
    },
    sendApproveWorker() {
      this.approveWorker.disabled = true;
      this.approveWorker.text = "...";
      return this.$robonomics.xrt.methods
        .approve(
          this.$robonomics.lighthouse.address,
          this.minimalStake * this.count
        )
        .send({
          from: this.$robonomics.account.address
        })
        .then(() => {
          this.approveWorker.text = this.$t("lighthouse.approve.approved");
          this.approveWorker.false = true;
          return this.fetchData();
        })
        .catch(() => {
          this.approveWorker.text = this.$t("lighthouse.approve.quotes");
          this.approveWorker.false = true;
        });
    },
    sendRefill() {
      this.refill.disabled = true;
      this.refill.text = "...";
      return this.$robonomics.lighthouse.methods
        .refill(this.minimalStake * this.count)
        .send({
          from: this.$robonomics.account.address
        })
        .then(() => {
          this.refill.text = "Ok";
          this.refill.disabled = false;
          this.$store.dispatch("providers/fetchData");
        })
        .then(() => this.fetchData())
        .catch(() => {
          this.refill.text = this.$t("lighthouse.approve.refill");
          this.refill.disabled = false;
        });
    }
  }
};
</script>
