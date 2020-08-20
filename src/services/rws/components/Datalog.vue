<template>
  <div>
    <hr />
    <div class="row">
      <div class="col-md-6" style="text-align: center;">
        available
        <span style="font-size: 20px; font-weight: bold;">
          {{ availableTps }}
        </span>
        tps
      </div>
      <div class="col-md-6" style="text-align: center;">
        used
        <span style="font-size: 20px; font-weight: bold;">
          {{ usedTps }}
        </span>
        tps
      </div>
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
          <a :href="`https://ipfs.io/ipfs/${item[1]}`" target="_blank">{{
            item[1]
          }}</a>
        </li>
      </ul>
      <div v-else>not found tx</div>
    </template>
    <div v-else>...</div>
  </div>
</template>

<script>
import moment from "moment";
import { getInstance, toIpfsHash } from "../utils/substrate";

export default {
  props: ["account", "amount"],
  data() {
    return {
      last: [],
      count: 0,
      countMonth: 0,
      proccess: false
    };
  },
  computed: {
    availableTps: function () {
      return this.$options.filters.fromWei(this.amount, 18);
    },
    usedTps: function () {
      return Math.round((this.countMonth / 86400) * 1000) / 1000;
    }
  },
  mounted() {
    this.run();
  },
  watch: {
    account: function (value, oldValue) {
      if (value !== oldValue) {
        this.run();
      }
    }
  },
  methods: {
    async run() {
      if (this.account) {
        this.proccess = true;
        try {
          const substrate = await getInstance();
          const log = (
            await substrate.query.datalog.datalog(this.account)
          ).toArray();
          this.count = log.length;

          const filterMonth = Number(moment().subtract(30, "day").format("x"));
          this.countMonth = log.reverse().filter((item) => {
            return Number(item[0]) > filterMonth;
          }).length;

          this.last = log
            .slice(-10)
            .reverse()
            .map((item) => {
              return [item[0], toIpfsHash(item[1])];
            });
          this.proccess = false;
        } catch {
          this.proccess = false;
        }
      }
    }
  }
};
</script>
