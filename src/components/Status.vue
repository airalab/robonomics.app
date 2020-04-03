<template>
  <div style="position: absolute;top: 20px;right: 20px;">
    <span v-if="status == statuses.OK" class="label label-green t-sm">Connected</span>
    <span v-else-if="status == statuses.WARNING" class="label label-orange t-sm">Connected</span>
    <span v-else class="label label-orange t-sm">Disconnected</span>
  </div>
</template>

<script>
import { getStatusPeers } from "../utils/tools";
import getConfigRobonomics from "../config/robonomics";

export default {
  data() {
    return {
      required: [],
      other: [],
      status: "",
      statuses: {
        OK: 1,
        WARNING: 2,
        ERROR: 3
      }
    };
  },
  mounted() {
    this.getPeers();
  },
  methods: {
    async getPeers() {
      try {
        const peers = await getStatusPeers(
          this.$ipfs,
          this.$robonomics,
          getConfigRobonomics().statusPeers
        );
        this.required = peers.required;
        this.other = peers.other;

        const count = peers.required.length;
        if (count > 1) {
          this.status = this.statuses.OK;
        } else if (count === 1) {
          this.status = this.statuses.WARNING;
        } else {
          this.status = this.statuses.ERROR;
        }
      } catch (error) {
        this.status = this.statuses.ERROR;
      }

      setTimeout(() => {
        this.getPeers();
      }, 5000);
    }
  }
};
</script>
