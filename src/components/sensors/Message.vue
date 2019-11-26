<template>
  <div>
    <h3 v-if="item.time">{{ $t("sensors.requestAt") }} {{ item.time }}</h3>
    <div v-if="item.status === 1" class="animation-fadein">
      <p>
        <span class="loader-ring align-vertical m-r-15"></span>
        <b class="align-vertical">1. {{ $t("sensors.status1") }}</b>
      </p>
    </div>
    <div v-else-if="item.status === 2">
      <p>
        <b class="align-vertical">1. {{ $t("sensors.status21") }}</b>
        <br />
        <span>IPFS data hash:</span>
        <br />
        <RLinkExplorer
          type="ipfs"
          :text="item.resultHash"
          classStyle="align-vertical"
        />
        <a
          class="align-vertical i-copy m-l-10"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="item.resultHash"
        ></a>
      </p>
      <p>
        <span class="loader-ring align-vertical m-r-15"></span>
        <b class="align-vertical">2. {{ $t("sensors.status22") }}</b>
      </p>
      <p class="icons-line">
        <a
          class="i-share"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="getLink(item.resultHash)"
        ></a>
        <a
          class="i-twitter"
          :href="getLinkTwitter(item.resultHash)"
          target="_blank"
        ></a>
      </p>
    </div>
    <div v-else-if="item.status === 3">
      <p>
        <b class="align-vertical">1. {{ $t("sensors.status31") }}</b>
        <br />
        <span>IPFS data hash:</span>
        <br />
        <RLinkExplorer
          type="ipfs"
          :text="item.resultHash"
          classStyle="align-vertical"
        />
        <a
          class="align-vertical i-copy m-l-10"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="item.resultHash"
        ></a>
      </p>
      <p>
        <b class="align-vertical">2. {{ $t("sensors.status21") }}</b>
        <a
          class="align-vertical i-copy m-l-10"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="JSON.stringify(item.result)"
        ></a>
        <br />
        <code>
          <pre>{{ item.result }}</pre>
        </code>
      </p>
      <p class="icons-line">
        <a
          class="i-share"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="getLink(item.resultHash)"
        ></a>
        <a
          class="i-twitter"
          :href="getLinkTwitter(item.resultHash)"
          target="_blank"
        ></a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: ["item", "lighthouse", "model", "agent"],
  methods: {
    getLink(result) {
      return `${window.location.origin}/${
        this.$router.resolve({
          name: "sensors",
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
</script>
