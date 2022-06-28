<template>
  <robo-card outlined>
    <robo-card-label>
      <robo-card-label-section
        ><robo-icon icon="signal"
      /></robo-card-label-section>
      <robo-card-label-section>Status</robo-card-label-section>
    </robo-card-label>

    <robo-card-section>
      <robo-text size="small" weight="bold">
        <robo-status v-if="status" type="success" textRight="IPFS connected" />
        <robo-status v-else type="error" textRight="IPFS disconnected" />
      </robo-text>
    </robo-card-section>
  </robo-card>
</template>

<script>
export default {
  data() {
    return {
      status: false,
      isOnline: false
    };
  },
  mounted() {
    this.getIpfsNodeInfo();
  },
  methods: {
    async getIpfsNodeInfo() {
      try {
        const ipfs = await this.$ipfs;
        this.status = true;
        this.isOnline = ipfs.isOnline();
      } catch (err) {
        console.log(err);
        this.status = false;
      }
    }
  }
};
</script>
