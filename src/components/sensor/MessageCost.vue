<template>
  <div>
    <h3 v-if="item.time">{{ $t("sensor.requestAt") }} {{ item.time }}</h3>
    <div v-if="item.status === 1" class="animation-fadein">
      <p>
        <span class="loader-ring align-vertical m-r-15"></span>
        <b class="align-vertical">1. {{ $t("sensor.cost.status1") }}</b>
      </p>
    </div>
    <div v-else-if="item.status === 2">
      <p>
        <b class="align-vertical">1. {{ $t("sensor.cost.status21") }}</b>
        <br />
        <span>Адрес контракта:</span>
        <br />
        <RLinkExplorer type="ipfs" :text="item.liability" classStyle="align-vertical" />
        <a
          class="align-vertical i-copy m-l-10"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="item.liability"
        ></a>
      </p>
      <p>
        <span class="loader-ring align-vertical m-r-15"></span>
        <b class="align-vertical">2. {{ $t("sensor.cost.status22") }}</b>
      </p>
    </div>
    <div v-else-if="item.status === 3">
      <p>
        <b class="align-vertical">1. {{ $t("sensor.cost.status21") }}</b>
        <br />
        <span>Адрес контракта:</span>
        <br />
        <RLinkExplorer type="ipfs" :text="item.liability" classStyle="align-vertical" />
        <a
          class="align-vertical i-copy m-l-10"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="item.liability"
        ></a>
      </p>
      <p>
        <b class="align-vertical">2. {{ $t("sensor.cost.status31") }}</b>
        <br />
        <span>IPFS data hash:</span>
        <br />
        <RLinkExplorer type="ipfs" :text="item.resultHash" classStyle="align-vertical" />
        <a
          class="align-vertical i-copy m-l-10"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="item.resultHash"
        ></a>
      </p>
      <p>
        <span class="loader-ring align-vertical m-r-15"></span>
        <b class="align-vertical">3. {{ $t("sensor.cost.status32") }}</b>
      </p>
      <p class="icons-line">
        <a
          class="i-share"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="getLink(item.resultHash)"
        ></a>
        <a class="i-twitter" :href="getLinkTwitter(item.resultHash)" target="_blank"></a>
      </p>
    </div>
    <div v-else-if="item.status === 4">
      <p>
        <b class="align-vertical">1. {{ $t("sensor.cost.status21") }}</b>
        <br />
        <span>Адрес контракта:</span>
        <br />
        <RLinkExplorer type="ipfs" :text="item.liability" classStyle="align-vertical" />
        <a
          class="align-vertical i-copy m-l-10"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="item.liability"
        ></a>
      </p>
      <p>
        <b class="align-vertical">2. {{ $t("sensor.cost.status41") }}</b>
        <br />
        <span>IPFS data hash:</span>
        <br />
        <RLinkExplorer type="ipfs" :text="item.resultHash" classStyle="align-vertical" />
        <a
          class="align-vertical i-copy m-l-10"
          href="javascript:;"
          title="copy to clipboard"
          v-clipboard:copy="item.resultHash"
        ></a>
      </p>
      <p>
        <b class="align-vertical">3. {{ $t("sensor.cost.status42") }}</b>
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
        <a class="i-twitter" :href="getLinkTwitter(item.resultHash)" target="_blank"></a>
      </p>
    </div>
  </div>
</template>

<script>
import Message from "./Message";
export default {
  mixins: [Message]
};
</script>
