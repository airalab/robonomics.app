<template>
  <section class="m-t-40">
    <section class="section-light">
      <h3>Send message to to Robonomics.network:</h3>
      <form>
        <section>
          <div class="form-item form-line-label">
            <label for="inputdata-model">
              Paste programm model *
              <span
                v-if="form.fields.model.error"
                class="input-msg"
              >Check if data correct, please.</span>
            </label>
            <input
              v-model="form.fields.model.value"
              class="container-full"
              :class="{ error: form.fields.model.error }"
              type="text"
              required
            />
          </div>
          <div id="more-form" style="margin-bottom: 24px;display:none">
            <div class="form-item form-line-label">
              <label for="inputdata-model">
                Paste programm objective *
                <span
                  v-if="form.fields.objective.error"
                  class="input-msg"
                >Check if data correct, please.</span>
              </label>
              <input
                v-model="form.fields.objective.value"
                class="container-full"
                :class="{ error: form.fields.objective.error }"
                type="text"
                required
              />
            </div>
            <!-- <div class="form-item form-line-label">
              <label for="inputdata-model">
                Paste token *
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
            <div class="form-item form-line-label">
              <label for="inputdata-model">
                Paste cost *
                <span
                  v-if="form.fields.cost.error"
                  class="input-msg"
                >Check if data correct, please.</span>
              </label>
              <input
                v-model="form.fields.cost.value"
                class="container-full"
                :class="{ error: form.fields.cost.error }"
                type="text"
                required
              />
            </div>-->
          </div>
          <a href="#" onclick="show(this, '#more-form', 'Minimize', 'Expand');return false;">Expand</a>
        </section>
      </form>
      <div v-if="form.error">Check if data correct, please.</div>
      <button v-on:click="sendMsgDemand" class="btn-green input-sm">Broadcast signal to network</button>
    </section>
    <section class="section-light">
      <h3>Messages from Robonomics network:</h3>
      <div v-for="(item, i) in log" :key="i" style="margin: 5px 0">
        [{{item.date.toLocaleString()}}] New {{item.type}} from
        <span
          v-if="item.type == 'demand'"
        >dapp account</span>
        <span v-else>Aira</span>&nbsp;
        <LinkExplorer :text="item.sender" />
      </div>
      <!-- <div>[21:55:32] Provider 0x2e...5041b7 sent tx to Ethereum network</div>-->
    </section>
  </section>
</template>

<script>
import Vue from "vue";

export default {
  data() {
    return {
      form: {
        fields: {
          model: {
            value: "QmZQKV8E3hjyxnEQGq1d4XCmeUDfzkAhryoJG3pcBkoUE6",
            rules: ["require", "hash"],
            error: false
          },
          objective: {
            value: "QmewrYzhpr6fgXQ83LXHcF4mu2otXvAeZVadRXEz7xF5UN",
            rules: ["require", "hash"],
            error: false
          },
          token: {
            value: "",
            rules: ["require", "address"],
            error: false
          },
          cost: {
            value: 0,
            rules: ["require", "number"],
            error: false
          }
        },
        error: false
      },
      account: "",
      messages: {},
      nonce: null
    };
  },
  computed: {
    log: function() {
      return Object.values(this.messages)
        .sort(function(a, b) {
          if (a.date > b.date) {
            return -1;
          }
          if (a.date < b.date) {
            return 1;
          }
          return 0;
        })
        .slice(0, 10);
    }
  },
  mounted() {
    this.account = this.$robonomics.account.address;
    this.form.fields.token.value = this.$robonomics.xrt.address;
    this.$robonomics.onDemand(null, msg => {
      const hash = msg.getHash();
      if (!this.messages[hash]) {
        Vue.set(this.messages, hash, {
          date: new Date(),
          type: "demand",
          sender: msg.sender
        });
      }
    });
    this.$robonomics.onOffer(null, msg => {
      const hash = msg.getHash();
      if (!this.messages[hash]) {
        Vue.set(this.messages, hash, {
          date: new Date(),
          type: "offer",
          sender: msg.sender
        });
      }
    });

    return this.$robonomics.factory.call
      .nonceOf(this.$robonomics.account.address)
      .then(r => {
        this.nonce = Number(r);
      });
  },
  methods: {
    validateForm() {
      this.form.error = false;
      for (let field in this.form.fields) {
        this.form.fields[field].error = false;
        this.form.fields[field].rules.forEach(rule => {
          if (
            rule === "require" &&
            this.form.fields[field].value.length === 0
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          } else if (
            rule === "number" &&
            !(Number(this.form.fields[field].value) >= 0)
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          } else if (
            rule === "hash" &&
            (this.form.fields[field].value.length !== 46 ||
              this.form.fields[field].value.substr(0, 2) !== "Qm")
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          } else if (
            rule === "address" &&
            !this.$robonomics.web3.isAddress(this.form.fields[field].value)
          ) {
            this.form.fields[field].error = true;
            this.form.error = true;
          }
        });
      }
      return !this.form.error;
    },
    sendMsgDemand() {
      if (this.validateForm()) {
        this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
          const demand = {
            model: this.form.fields.model.value,
            objective: this.form.fields.objective.value,
            token: this.form.fields.token.value,
            cost: Number(this.form.fields.cost.value),
            lighthouse: this.$robonomics.lighthouse.address,
            validator: "0x0000000000000000000000000000000000000000",
            validatorFee: 0,
            deadline: r.number + 1000,
            nonce: this.nonce
          };
          this.$store.dispatch("sender/sendDemand", demand).then(() => {
            this.nonce++;
          });
        });
      }
    }
  }
};
</script>
