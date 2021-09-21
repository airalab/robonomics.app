<template>
  <div
    class="techstatus"
    :class="{ on: status == statuses.OK || status == statuses.WARNING }"
    title="IPFS"
  >
    <div class="techstatus-logo">
      <IconIpfs />
    </div>
    <div class="techstatus-actions">
      <div class="tip">IPFS services</div>
      <template v-if="status == statuses.OK || status == statuses.WARNING"
        >Pubsub connected</template
      >
      <template v-else>Pubsub disconnected</template>
    </div>
  </div>
</template>

<script>
import { getStatusPeers } from "@/utils/tools";
import getConfigRobonomics from "@/config/robonomics";
import IconIpfs from "./IconIpfs";

export default {
  components: { IconIpfs },
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
