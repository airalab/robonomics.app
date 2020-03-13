export default {
  props: ["item", "lighthouse", "model", "agent"],
  methods: {
    getLink(result) {
      return `${window.location.origin}/${
        this.$router.resolve({
          name: "sensor-result",
          params: {
            lighthouse: this.lighthouse,
            model: this.model,
            agent: this.agent,
            result: result
          }
        }).href
      }`;
    },
    getDescription() {
      return "Look data from my sensor in IPFS via Robonomics dapp: ";
    },
    getLinkTwitter(result) {
      return `https://twitter.com/intent/tweet?text=${window.encodeURIComponent(
        this.getDescription() + this.getLink(result)
      )}&ref_src=twsrc%5Etfw`;
    }
  }
};
