<template>
  <div>
    <hr />
    <div class="row">
      <div class="col-md-12" style="text-align: center">
        Bandwidth
        <span style="font-size: 20px; font-weight: bold">
          {{ bandwidth }}
        </span>
        %
      </div>
      <!-- <div class="col-md-6" style="text-align: center">
        used
        <span style="font-size: 20px; font-weight: bold">
          {{ usedTps }}
        </span>
        tps
      </div> -->
    </div>
    <h3>Datalog history by account</h3>
    <!-- <p>
      Count all tx:
      <b>{{ count }}</b>
    </p> -->
    <h4>Last 10 tx</h4>
    <template v-if="!proccess">
      <ul v-if="count > 0">
        <li v-for="(item, k) in last" :key="k">
          <small>{{ new Date(Number(item[0])).toLocaleString() }}</small>
          <br />
          <!-- <a :href="`https://ipfs.io/ipfs/${item[1]}`" target="_blank">
            {{ item[1] }}
          </a> -->
          <span>
            {{ item[1] }}
          </span>
        </li>
      </ul>
      <div v-else>not found tx</div>
    </template>
    <div v-else>...</div>
  </div>
</template>

<script>
import moment from "moment";
// import { u8aToString } from "@polkadot/util";
import { getInstance } from "../../../utils/substrate";
import { getBandwidth } from "../utils";
import BN from "bignumber.js";

export default {
  props: ["account", "amount"],
  data() {
    return {
      last: [],
      count: 0,
      countMonth: 0,
      proccess: false,
      bandwidth: 0
    };
  },
  // computed: {
  //   availableTps: function () {
  //     return this.$options.filters.fromWei(this.amount, 18);
  //   },
  //   usedTps: function () {
  //     return Math.round((this.countMonth / 86400) * 1000) / 1000;
  //   }
  // },
  created() {
    this.getBandwidth();
    this.run();
    setInterval(() => {
      this.getBandwidth();
    }, 3000);
  },
  watch: {
    account: function (value, oldValue) {
      if (value !== oldValue) {
        this.getBandwidth();
        this.up();
      }
    }
  },
  methods: {
    async getBandwidth() {
      if (this.account) {
        const bandwidth = await getBandwidth(this.account);
        if (bandwidth.toString()) {
          this.bandwidth = new BN(bandwidth)
            .multipliedBy(new BN("100"))
            .div(new BN("1000000000"))
            .toString(10);
        }
      }
    },
    async run() {
      this.proccess = true;
      await this.up();
      this.proccess = false;
      setInterval(() => {
        this.up();
      }, 5000);
    },
    async up() {
      const log = await this.getLog();

      this.count = log.length;

      const filterMonth = Number(moment().subtract(30, "day").format("x"));
      this.countMonth = log.reverse().filter((item) => {
        return Number(item[0]) > filterMonth;
      }).length;

      this.last = log
        .slice(0, 10)
        // .reverse()
        .map((item) => {
          return [item[0], item[1]];
          // return [item[0], u8aToString(item[1])];
        });
    },
    async getLog() {
      if (this.account) {
        try {
          const api = await getInstance();
          return (await api.query.datalog.datalog(this.account)).toArray();
        } catch {
          return [];
        }
      }
      return [];
    }
  }
};
</script>
