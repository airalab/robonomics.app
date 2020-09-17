<template>
  <fragment>
    <Progress :percent="percent" :amount="totalBurnFormat" />

    <div class="row" style="margin-top: 30px;">
      <div class="col-md-6" style="text-align: center; font-size: 20px;">
        Ethereum mainnet balance
      </div>
      <div class="col-md-6" style="text-align: center; font-size: 20px;">
        Robonomics Parachain allocation
      </div>
    </div>
    <div class="row">
      <div
        class="col-md-6"
        style="text-align: center; font-size: 20px; font-weight: bold;"
      >
        {{ balanceXrtFormat }}
      </div>
      <div
        class="col-md-6"
        style="text-align: center; font-size: 20px; font-weight: bold;"
      >
        {{ burnFormat }}
      </div>
    </div>

    <Activate @upBurn="getBurnAmount" />

    <template v-if="Object.keys(list).length > 0">
      <hr />
      <table class="container-full table-hover table-responsive">
        <tbody>
          <tr v-for="(amount, account) in list" :key="account">
            <td>{{ account }}</td>
            <td>{{ amount }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </fragment>
</template>

<script>
import token from "@/mixins/token";
import utils from "web3-utils";
import { encodeAddress } from "@polkadot/util-crypto";
import config from "../config";
import Activate from "./Activate";
import Progress from "./Progress";
import ExodusAbi from "../abi/Exodus.json";

export default {
  mixins: [token],
  components: {
    Activate,
    Progress
  },
  data() {
    return {
      burn: "0",
      totalBurn: "0",
      list: {}
    };
  },
  created() {
    this.watchToken(config.XRT, this.$robonomics.account.address);
    this.getBurnAmount();
  },
  computed: {
    balanceXrt: function () {
      return this.balance(config.XRT, this.$robonomics.account.address);
    },
    balanceXrtFormat: function () {
      return this.balanceFormat(config.XRT, this.$robonomics.account.address);
    },
    burnFormat: function () {
      return this.$options.filters.fromWei(this.burn, 9, "XRT");
    },
    totalBurnFormat: function () {
      return this.$options.filters.fromWei(this.totalBurn.toString(), 9, "XRT");
    },
    percent: function () {
      return Math.round(
        new utils.BN(this.totalBurn)
          .mul(new utils.BN("100"))
          .div(new utils.BN("1000000000000000"))
          .toNumber()
      );
    }
  },
  methods: {
    async getBurnAmount() {
      const contract = new this.$robonomics.web3.eth.Contract(
        ExodusAbi,
        config.EXODUS
      );
      const eventsAll = await contract.getPastEvents("Migration", {
        filter: {},
        fromBlock: 0,
        toBlock: "latest"
      });
      const events = await contract.getPastEvents("Migration", {
        filter: {
          sender: this.$robonomics.account.address
        },
        fromBlock: 0,
        toBlock: "latest"
      });

      const listNigative = {};
      const list = {};
      events.forEach((event) => {
        const { amount, account_id } = event.returnValues;
        if (!Object.prototype.hasOwnProperty.call(listNigative, account_id)) {
          listNigative[account_id] = new utils.BN("0");
        }
        listNigative[account_id] = listNigative[account_id].add(
          new utils.BN(amount)
        );
      });
      Object.keys(listNigative).forEach((account_id) => {
        list[encodeAddress(account_id, 32)] = this.$options.filters.fromWei(
          listNigative[account_id],
          9,
          "XRT"
        );
      });
      this.list = list;

      const summ = events.reduce((accumulator, event) => {
        return new utils.BN(accumulator).add(
          new utils.BN(event.returnValues.amount)
        );
        // return accumulator + event.returnValues.amount;
      }, "0");
      this.burn = summ.toString();

      this.totalBurn = eventsAll.reduce((accumulator, event) => {
        return new utils.BN(accumulator).add(
          new utils.BN(event.returnValues.amount)
        );
      }, "0");
    }
  }
};
</script>
