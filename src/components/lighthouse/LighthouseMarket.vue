<template>
  <section class="m-t-40">
    <h2>Test lighthouse</h2>
    <div class="row">
      <div class="col-lg-4">
        <div class="window">
          <div class="window-head">
            <span>Demand</span>
            <button v-on:click="sendMsgDemand" class="btn-green input-sm" style="width:100%">Test</button>
          </div>
          <div class="window-content">
            <div v-for="(item, i) in demands" :key="i" class="section-light m-t-10">
              <p>
                <span class="t-sm">Sent from account:</span>
                <br />
                <LinkExplorer :text="item.sender" />
              </p>
              <p>
                <span class="t-sm">Demand program description:</span>
                <br />
                <LinkExplorer type="ipfs" :text="item.model" />
              </p>
              <p>
                <span class="t-sm">Data for program execution:</span>
                <br />
                <LinkExplorer type="ipfs" :text="item.objective" />
              </p>
              <p>
                <a
                  class="t-sm"
                  :href="item.token | urlExplorer('token')"
                  target="_blank"
                >Payment token</a>&nbsp;
                <span class="t-sm">cost:</span>
                <br />
                <b>{{ item.cost }}</b>
              </p>
              <p>
                <span class="t-sm">Valid before:</span>
                <br />
                <b>{{ item.deadline }} block</b>
              </p>
              <p>
                <span class="t-sm">Status:</span>
                <br />
                <b>Without observing network</b>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="window">
          <div class="window-head">
            <span>Offer</span>
            <button v-on:click="sendMsgOffer" class="btn-green input-sm" style="width:100%">Test</button>
          </div>
          <div class="window-content">
            <div v-for="(item, i) in offers" :key="i" class="section-light m-t-10">
              <p>
                <span class="t-sm">Sent from account:</span>
                <br />
                <LinkExplorer :text="item.sender" />
              </p>
              <p>
                <span class="t-sm">Demand program description:</span>
                <br />
                <LinkExplorer type="ipfs" :text="item.model" />
              </p>
              <p>
                <span class="t-sm">Data for program execution:</span>
                <br />
                <LinkExplorer type="ipfs" :text="item.objective" />
              </p>
              <p>
                <a
                  class="t-sm"
                  :href="item.token | urlExplorer('token')"
                  target="_blank"
                >Payment token</a>&nbsp;
                <span class="t-sm">cost:</span>
                <br />
                <b>{{ item.cost }}</b>
              </p>
              <p>
                <span class="t-sm">Valid before:</span>
                <br />
                <b>{{ item.deadline }} block</b>
              </p>
              <p>
                <span class="t-sm">Status:</span>
                <br />
                <b>Without observing network</b>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="window">
          <div class="window-head">
            <span>Liabilities</span>
          </div>
          <div class="window-content">
            <div v-for="(item, i) in lis" :key="i" class="section-light m-t-10">
              <p>
                <span class="t-sm">Liability:</span>
                <br />
                <LinkExplorer :text="item.address" />
              </p>
              <p>
                <span class="t-sm">Provider address:</span>
                <br />
                <LinkExplorer :text="item.worker" />
              </p>
              <p>
                <span class="t-sm">Program description:</span>
                <br />
                <LinkExplorer type="ipfs" :text="item.model" />
              </p>
              <p>
                <span class="t-sm">Data for program execution:</span>
                <br />
                <LinkExplorer type="ipfs" :text="item.objective" />
              </p>
              <p>
                <a
                  class="t-sm"
                  :href="item.token | urlExplorer('token')"
                  target="_blank"
                >Payment token</a>&nbsp;
                <span class="t-sm">cost:</span>
                <br />
                <b>{{ item.cost }}</b>
              </p>
              <p>
                <span class="t-sm">Promisee:</span>
                <br />
                <LinkExplorer :text="item.promisee" />
              </p>
              <p>
                <span class="t-sm">Promisor:</span>
                <br />
                <LinkExplorer :text="item.promisor" />
              </p>
              <button
                v-if="item.promisor == account && item.result == ''"
                v-on:click="postResult(item.address)"
                class="btn-green input-sm container-full"
              >Post result</button>
              <div style="margin: 20px 0px;" v-if="item.result != ''">
                <div class="t-small">Results:</div>
                <b class="code-overflow-line">
                  <LinkExplorer type="ipfs" :text="item.result" />
                </b>
              </div>
              <div style="margin: 20px 0px;" v-if="item.result == ''">
                <div class="t-small">Results:</div>
                <b class="code-overflow-line">...</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import config from "../../config";
import getIpfs from "../../utils/ipfs";
import { genObjective } from "../../utils/utils";

export default {
  data() {
    return {
      account: "",
      model: null,
      nonce: null
    };
  },
  computed: {
    ...mapGetters("sender", [
      "getLastObjectiveDemand",
      "getLastObjectiveOffer"
    ]),
    ...mapGetters("messages", ["offers", "demands"]),
    ...mapState("messages", ["lis"])
  },
  mounted() {
    getIpfs().then(ipfs => {
      ipfs.id((err, info) => {
        this.model = info.id;
      });
    });

    this.account = this.$robonomics.account.address;
    return this.$robonomics.factory.call
      .nonceOf(this.$robonomics.account.address)
      .then(r => {
        this.nonce = Number(r);
      });
  },
  methods: {
    postResult(liability) {
      this.$robonomics
        .sendResult({
          liability,
          success: true,
          result: config.ROBONOMICS.result
        })
        .then(() => {
          console.log("ok");
        });
    },
    sendMsgDemand() {
      if (!this.model) {
        return;
      }
      this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
        const demand = {
          model: this.model,
          objective: this.getLastObjectiveOffer,
          token: this.$robonomics.xrt.address,
          cost: 0,
          lighthouse: this.$robonomics.lighthouse.address,
          validator: "0x0000000000000000000000000000000000000000",
          validatorFee: 0,
          deadline: r.number + 1000,
          nonce: this.nonce
        };
        if (demand.objective === null) {
          genObjective(Math.random()).then(r => {
            demand.objective = r;
            this.$store.dispatch("sender/sendDemand", demand).then(() => {
              this.nonce++;
            });
          });
        } else {
          this.$store.dispatch("sender/sendDemand", demand).then(() => {
            this.nonce++;
          });
        }
      });
    },
    sendMsgOffer() {
      if (!this.model) {
        return;
      }
      this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
        const offer = {
          model: this.model,
          objective: this.getLastObjectiveDemand,
          token: this.$robonomics.xrt.address,
          cost: 0,
          validator: "0x0000000000000000000000000000000000000000",
          lighthouse: this.$robonomics.lighthouse.address,
          lighthouseFee: 0,
          deadline: r.number + 1000,
          nonce: this.nonce
        };
        if (offer.objective === null) {
          genObjective(Math.random()).then(r => {
            offer.objective = r;
            this.$store.dispatch("sender/sendOffer", offer).then(() => {
              this.nonce++;
            });
          });
        } else {
          this.$store.dispatch("sender/sendOffer", offer).then(() => {
            this.nonce++;
          });
        }
      });
    }
  }
};
</script>
