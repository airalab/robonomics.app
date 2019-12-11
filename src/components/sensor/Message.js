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
    getLinkTwitter(result) {
      return `https://twitter.com/intent/tweet?text=${window.encodeURIComponent(
        this.getLink(result)
      )}&ref_src=twsrc%5Etfw`;
    }
  }
};
