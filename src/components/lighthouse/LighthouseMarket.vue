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
                <IconLink
                  :href="`https://etherscan.io/address/${item.sender}`"
                  :text="item.sender"
                />
              </p>
              <p>
                <span class="t-sm">Demand program description:</span>
                <br />
                <IconLink
                  :href="`https://ipfs.io/ipfs/${item.model}`"
                  :text="item.model"
                  :isIcon="false"
                />
              </p>
              <p>
                <span class="t-sm">Data for program execution:</span>
                <br />
                <IconLink
                  :href="`https://ipfs.io/ipfs/${item.objective}`"
                  :text="item.objective"
                  :isIcon="false"
                />
              </p>
              <p>
                <a
                  class="t-sm"
                  :href="`https://etherscan.io/token/${item.token}`"
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
                <IconLink
                  :href="`https://etherscan.io/address/${item.sender}`"
                  :text="item.sender"
                />
              </p>
              <p>
                <span class="t-sm">Demand program description:</span>
                <br />
                <IconLink
                  :href="`https://ipfs.io/ipfs/${item.model}`"
                  :text="item.model"
                  :isIcon="false"
                />
              </p>
              <p>
                <span class="t-sm">Data for program execution:</span>
                <br />
                <IconLink
                  :href="`https://ipfs.io/ipfs/${item.objective}`"
                  :text="item.objective"
                  :isIcon="false"
                />
              </p>
              <p>
                <a
                  class="t-sm"
                  :href="`https://etherscan.io/token/${item.token}`"
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
                <IconLink
                  :href="`https://etherscan.io/address/${item.address}`"
                  :text="item.address"
                />
              </p>
              <p>
                <span class="t-sm">Provider address:</span>
                <br />
                <IconLink
                  :href="`https://etherscan.io/address/${item.worker}`"
                  :text="item.worker"
                />
              </p>
              <p>
                <span class="t-sm">Program description:</span>
                <br />
                <IconLink
                  :href="`https://ipfs.io/ipfs/${item.model}`"
                  :text="item.model"
                  :isIcon="false"
                />
              </p>
              <p>
                <span class="t-sm">Data for program execution:</span>
                <br />
                <IconLink
                  :href="`https://ipfs.io/ipfs/${item.objective}`"
                  :text="item.objective"
                  :isIcon="false"
                />
              </p>
              <p>
                <a
                  class="t-sm"
                  :href="`https://etherscan.io/token/${item.token}`"
                  target="_blank"
                >Payment token</a>&nbsp;
                <span class="t-sm">cost:</span>
                <br />
                <b>{{ item.cost }}</b>
              </p>
              <p>
                <span class="t-sm">Promisee:</span>
                <br />
                <IconLink
                  :href="`https://etherscan.io/address/${item.promisee}`"
                  :text="item.promisee"
                />
              </p>
              <p>
                <span class="t-sm">Promisor:</span>
                <br />
                <IconLink
                  :href="`https://etherscan.io/address/${item.promisor}`"
                  :text="item.promisor"
                />
              </p>
              <button
                v-if="item.promisor == account && item.result == ''"
                v-on:click="postResult(item.address)"
                class="btn-green input-sm container-full"
              >Post result</button>
              <div style="margin: 20px 0px;" v-if="item.result != ''">
                <div class="t-small">Results:</div>
                <b class="code-overflow-line">
                  <IconLink
                    :href="`https://ipfs.io/ipfs/${item.result}`"
                    :text="item.result"
                    :isIcon="false"
                  />
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

const intervals = {};

export default {
  data() {
    return {
      account: "",
      nonce: null
    };
  },
  computed: {
    ...mapGetters("messages", ["offers", "demands"]),
    ...mapState("messages", ["lis"])
  },
  mounted() {
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
      this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
        const demand = {
          model: config.ROBONOMICS.model,
          objective: config.ROBONOMICS.objective,
          token: this.$robonomics.xrt.address,
          cost: 0,
          lighthouse: this.$robonomics.lighthouse.address,
          validator: "0x0000000000000000000000000000000000000000",
          validatorFee: 0,
          deadline: r.number + 1000,
          nonce: this.nonce
        };
        this.nonce++;
        this.$robonomics
          .sendDemand(demand, true, msg => {
            intervals[msg.getHash()] = setInterval(() => {
              this.$robonomics.messenger.channel.send(msg.encode());
            }, 5000);
          })
          .then(liability => {
            console.log("liability demand", liability.address);
            liability.getInfo().then(info => {
              clearInterval(intervals[info.demandHash]);
            });
          });
      });
    },
    sendMsgOffer() {
      this.$robonomics.web3.eth.getBlock("latest", (e, r) => {
        const offer = {
          model: config.ROBONOMICS.model,
          objective: config.ROBONOMICS.objective,
          token: this.$robonomics.xrt.address,
          cost: 0,
          validator: "0x0000000000000000000000000000000000000000",
          lighthouse: this.$robonomics.lighthouse.address,
          lighthouseFee: 0,
          deadline: r.number + 1000,
          nonce: this.nonce
        };
        this.nonce++;
        this.$robonomics
          .sendOffer(offer, true, msg => {
            intervals[msg.getHash()] = setInterval(() => {
              this.$robonomics.messenger.channel.send(msg.encode());
            }, 5000);
          })
          .then(liability => {
            console.log("liability offer", liability.address);
            liability.getInfo().then(info => {
              clearInterval(intervals[info.offerHash]);
            });
          });
      });
    }
  }
};
</script>
