<template>
  <div>
    <div class="grid-3">
      <div>
        <span class="strong t-gt">{{ totalBurnFormat }} XRT</span><br />
        <p class="strong">Swapped from ERC-20 to Robonomics Parachain</p>
      </div>

      <div>
        <span class="strong t-gt">{{ balanceXrtFormat }} XRT</span><br />
        <p class="strong">Your Ethereum mainnet balance</p>
      </div>

      <div>
        <span class="strong t-gt">{{ burnFormat }} XRT</span><br />
        <p class="strong">Your Robonomics Parachain allocation</p>
      </div>
    </div>

    <!-- <Progress :percent="percent" :amount="totalBurn" /> -->

    <Activate @up-burn="getBurnAmount" />
  </div>

  <!-- <fragment>
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
  </fragment> -->
</template>

<script>
import token from "@/mixins/token";
import utils from "web3-utils";
// import { encodeAddress } from "@polkadot/util-crypto";
import config from "../config";
import Activate from "./Activate";
// import Progress from "./Progress";
import ExodusAbi from "../abi/Exodus.json";
import filters from "@/utils/filters";

export default {
  mixins: [token],
  components: {
    Activate
    // Progress
  },
  data() {
    return {
      burn: "0",
      totalBurn: "0"
      // list: {}
    };
  },
  created() {
    if (this.$robonomics.account) {
      this.watchToken(config.XRT, this.$robonomics.account.address);
      this.getBurnAmount();
    }
  },
  computed: {
    balanceXrt: function () {
      return this.$robonomics.account
        ? this.balance(config.XRT, this.$robonomics.account.address)
        : 0;
    },
    balanceXrtFormat: function () {
      return Number(filters.fromWei(this.balanceXrt, 9, ""))
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$& ");
    },
    burnFormat: function () {
      return Number(filters.fromWei(this.burn, 9, ""))
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$& ");
    },
    totalBurnFormat: function () {
      return Number(filters.fromWei(this.totalBurn.toString(), 9, ""))
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$& ");
    }
    // percent: function () {
    //   return Math.round(
    //     new utils.BN(this.totalBurn)
    //       .mul(new utils.BN("100"))
    //       .div(new utils.BN("1000000000000000"))
    //       .toNumber()
    //   );
    // }
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

      // const listNigative = {};
      // const list = {};
      // events.forEach((event) => {
      //   const { amount, account_id } = event.returnValues;
      //   if (!Object.prototype.hasOwnProperty.call(listNigative, account_id)) {
      //     listNigative[account_id] = new utils.BN("0");
      //   }
      //   listNigative[account_id] = listNigative[account_id].add(
      //     new utils.BN(amount)
      //   );
      // });
      // Object.keys(listNigative).forEach((account_id) => {
      //   list[encodeAddress(account_id, 32)] = filters.fromWei(
      //     listNigative[account_id],
      //     9,
      //     "XRT"
      //   );
      // });
      // this.list = list;

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
