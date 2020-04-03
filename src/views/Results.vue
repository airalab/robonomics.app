<template>
  <Page>
    <section class="section-light section-centered">
      <h2>Results</h2>
      <table class="container-full table-hover">
        <thead>
          <tr>
            <th>agent</th>
            <th style="width:20%">counter</th>
            <th style="width:20%">time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(agent, index) in Object.keys(agents)" :key="index">
            <td>{{ agent }}</td>
            <td>{{ agents[agent].count }}</td>
            <td>{{ agents[agent].time }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </Page>
</template>

<script>
import Vue from "vue";
import Page from "@/components/layout/Page";
import { Account } from "robonomics-js";
import config from "~config";

export default {
  components: {
    Page
  },
  data() {
    return {
      agents: {}
    };
  },
  created() {
    if (this.$robonomics.messenger) {
      this.$robonomics.messenger.stop();
    }
    this.$robonomics
      .initLighthouse(config.chain.get().DEFAULT_LIGHTHOUSE)
      .then(() => {
        this.ready = true;
        this.$robonomics.onResult(msg => {
          const sender = Account.recoveryMessage(msg);
          if (!Object.prototype.hasOwnProperty.call(this.agents, sender)) {
            Vue.set(this.agents, sender, { count: 0, time: "" });
          }
          Vue.set(this.agents, sender, {
            count: this.agents[sender].count + 1,
            time: new Date().toLocaleString()
          });
        });
      });
  }
};
</script>
