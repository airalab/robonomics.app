<template>
  <Page>
    <RCard class="section-centered">
      <h2>Robot-as-a-Service dashboard</h2>
      <blockquote>
        <a
          href="https://blog.aira.life/robonomics-web-services-and-rws-token-intro-d730ab50ad42"
          target="_blank"
          >Robot-as-a-service intro on medium</a
        >
      </blockquote>

      <h3>Metrics</h3>
      <div class="row" style="margin: 20px 0;">
        <div class="col-md-12">
          <span style="color: #67ab9f; font-size: 24px; font-weight: bold;">{{
            success
          }}</span>
          <br />completed operations this month
        </div>
      </div>
      <!-- <div class="row" style="margin:20px 0">
        <div class="col-md-6">
          <span style="color:#67ab9f;font-size: 24px;font-weight: bold;">96%</span>
          <br />log files (41,472) correct in this month
        </div>
        <div class="col-md-6">
          <span style="color:#66b2ff;font-size: 24px;font-weight: bold;">7</span>
          <br />log files under manual analysis
        </div>
      </div>-->
      <div class="row" style="margin: 20px 0;">
        <div class="col-md-6">
          <span style="color: #67ab9f; font-size: 24px; font-weight: bold;">{{
            fromNow
          }}</span>
          <br />
          <a href>last transaction</a>
        </div>
        <div class="col-md-6">
          <span style="color: #66b2ff; font-size: 24px; font-weight: bold;">{{
            countTx
          }}</span>
          <br />issues successfully completed
        </div>
      </div>

      <h3>Usage</h3>
      <div class="row" style="margin: 20px 0;">
        <div class="col-md-12">
          <span style="color: #67ab9f; font-size: 24px; font-weight: bold;"
            >{{ cost }} $</span
          >
        </div>
      </div>

      <h3 id="asd">Last transactions from your robot-as-a-service</h3>
      <ul>
        <li v-for="(log, k) in last" :key="k">
          {{ log.date }}
          {{ log.action }}
          <br />
          <a :href="`https://ipfs.io/ipfs/${log.data}`" target="_blank">{{
            log.data
          }}</a>
        </li>
      </ul>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import axios from "axios";
import moment from "moment";

export default {
  components: {
    Page
  },
  data() {
    return {
      success: 0,
      error: 0,
      cost: 0,
      countTx: 0,
      lastTxTime: 0,
      fromNow: "-",
      last: []
    };
  },
  created() {
    const socket = io("https://raas.airalab.org/");
    socket.on("update", () => {
      this.update();
    });
    this.update();
    setInterval(() => {
      this.fromNow = moment(this.lastTxTime, "x")
        .locale(this.$i18n.locale)
        .fromNow();
    }, 5000);
  },
  methods: {
    update() {
      axios.get("https://raas.airalab.org/api/raas/all").then((r) => {
        if (!r.data.error) {
          this.success = r.data.result.success;
          this.error = r.data.result.error;
          this.countTx = r.data.result.countTx;
          this.cost = r.data.result.cost;
          this.lastTxTime = r.data.result.lastTxTime;
          this.fromNow = moment(this.lastTxTime, "x")
            .locale(this.$i18n.locale)
            .fromNow();
          this.last = r.data.result.last.map((item) => {
            return {
              ...item,
              date: new Date(item.chain_time).toLocaleString()
            };
          });
        }
      });
    }
  }
};
</script>
