<template>
  <fragment>
    <section class="section-light">
      <form>
        <h3>Send message to the Robonomics.network</h3>
        <div class="form-item form-line-label">
          <label for="inputdata-model">
            <span>The program's model</span>
            <a
              class="js-tooltip m-l-10"
              href="javascript:;"
              data-tooltip="'The CPSs behavioral model, or program, which takes into account the technical and economic parameters of its communication' - from Robonomics White Paper, 4 Liability of the machine"
            >
              <i class="i-info"></i>
            </a>
          </label>
          <input
            v-model="form.fields.model.value"
            class="container-full"
            :class="{ error: form.fields.model.error }"
            type="text"
            placeholder="Hash from IPFS"
            required
          />
        </div>

        <div class="form-item">
          <div class="form-item form-line-label">
            <label for="input3">
              <span>Robot ID</span>
            </label>
            <input
              v-model="form.fields.objective.value"
              class="container-full"
              :class="{ error: form.fields.objective.error }"
              type="text"
              placeholder="Hash from IPFS"
              required
            />
          </div>
        </div>
        <!-- <div class="form-item form-line-label">
          <a
            class="a-dashed"
            href="javascript:;"
            onclick="show(this, '#moreopts', 'Minimize', 'More options');return false;"
          >More options</a>
        </div>-->
      </form>
      <section class="m-b-0">
        <div v-if="form.error" style="margin: 5px 0;">Check if data correct, please.</div>
        <button v-on:click="sendMsgDemand" :disabled="watch" class="btn-green">
          <div class="loader-ring" v-if="watch"></div>&nbsp;Broadcast signal to the network
        </button>
      </section>
    </section>

    <section class="section-light window" id="window-lighthouse-messages">
      <div class="window-head">
        <span>Messages from the Robonomics.network</span>
        <a class="window-head-toggle" href="#">–</a>
      </div>
      <div class="window-content">
        <div v-for="(item, i) in log" :key="`${i}-${item.date}`" style="margin: 5px 0">
          <template v-if="item.type == 'liability'">
            <Avatar :address="item.address" class="avatar-small align-vertical m-r-10" />
            <b>[{{item.date.toLocaleString()}}]</b>
            New {{item.type}}&nbsp;
            <a
              :href="item.address | urlExplorer"
              target="_blank"
            >{{ item.address | labelAddress }}</a>
          </template>
          <template v-else>
            <Avatar :address="item.sender" class="avatar-small align-vertical m-r-10" />
            <b>[{{item.date.toLocaleString()}}]</b>
            New {{item.type}} from
            <span v-if="item.type == 'demand'">dapp account</span>
            <span v-else>Aira</span>&nbsp;
            <a
              :href="item.sender | urlExplorer"
              target="_blank"
            >{{ item.sender | labelAddress }}</a>
          </template>
          <hr />
        </div>
      </div>
    </section>
  </fragment>
</template>

<script>
import Vue from "vue";

export default {
  data() {
    return {
      form: {
        fields: {
          model: {
            value: "",
            rules: ["require", "hash"],
            error: false
          },
          objective: {
            value: "",
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
      nonce: null,
      id: null
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
    },
    demand() {
      return this.$store.getters["sender/demandById"](this.id);
    },
    watch() {
      return this.demand && this.demand.status > 0 && this.demand.status < 6
        ? true
        : false;
    }
  },
  watch: {
    demand: function(newStatus) {
      if (newStatus.status === 6) {
        this.setNonce();
      }
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
    this.$robonomics.onLiability((err, liability) => {
      if (
        this.demand &&
        this.id &&
        liability.address &&
        this.demand.sender === this.$robonomics.account.address
      ) {
        this.$store.dispatch("sender/setContract", {
          id: this.id,
          address: liability.address
        });
      }
      if (!this.messages[liability.address]) {
        Vue.set(this.messages, liability.address, {
          date: new Date(),
          type: "liability",
          address: liability.address
        });
      }
    });
    this.tooltip();

    return this.setNonce();
  },
  methods: {
    setNonce() {
      this.$robonomics.factory.call
        .nonceOf(this.$robonomics.account.address)
        .then(r => {
          this.nonce = Number(r);
        });
    },
    tooltip() {
      const reference = document.querySelectorAll(".js-tooltip");
      if (reference) {
        reference.forEach(function(elem) {
          new Tooltip(elem, {
            title: elem.getAttribute("data-tooltip"),
            placement: elem.getAttribute("data-placement") || "auto",
            container: "body"
          });
        });
      }
    },
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
            this.form.fields[field].value.length !== 46
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
          this.$store.dispatch("sender/sendDemand", demand).then(id => {
            this.id = id;
          });
        });
      }
    }
  }
};
</script>
