<template>
  <fragment>
    <span class="t-sm">{{ $t("passport.liability") }}</span>
    <blockquote>
      <a class="t-lg content-overflow" :href="address | urlExplorer" target="_blank">{{address}}</a>
    </blockquote>
    <template v-if="passport">
      <section v-if="passport.emai || passport.info">
        <div class="form-section-title">{{ $t("passport.subtitle1") }}</div>
        <section v-if="passport.emai">
          <span class="t-sm">{{ $t("passport.email") }}:</span>
          <br />
          <span>{{ passport.email }}</span>
        </section>
        <hr v-if="passport.emai && passport.info" />
        <section v-if="passport.info">
          <span class="t-sm">{{ $t("passport.info") }}:</span>
          <br />
          <span>{{ passport.info }}</span>
        </section>
      </section>
      <section v-if="passport.meta || passport.images">
        <div class="form-section-title">{{ $t("passport.subtitle2") }}</div>
        <section v-if="passport.meta">
          <span class="t-sm">{{ $t("passport.meta") }}:</span>
          <br />
          <a class="ptint-hidden" href="javascript:;" @click="view(passport.meta)">{{ metaSlice }}</a>
          <div v-if="viewMeta">
            <div v-if="loadJson">
              <div class="loader-ring"></div>
            </div>
            <pre class="pre__overflow" v-else>{{json}}</pre>
            <a
              class="btn-blue btn-sm ptint-hidden"
              :href="passport.meta | urlIpfs"
              target="_blank"
            >{{ $t("passport.openIpfs") }}</a>
            <div class="print-show">Link in IPFS: {{passport.meta | urlIpfs}}</div>
          </div>
        </section>
        <hr v-if="passport.meta && passport.images" />
        <section v-if="passport.images">
          <span class="t-sm">{{ $t("passport.images") }}:</span>
          <div v-for="(image, key) in passport.images" :key="key">
            <a
              class="ptint-hidden"
              href="javascript:;"
              @click="image.show = !image.show"
            >{{image.sliceHash}}</a>
            <div v-if="image.show">
              <img class="i-block" alt :src="image.hash | urlIpfs" />
              <a
                class="btn-blue btn-sm m-t-5 ptint-hidden"
                :href="image.hash | urlIpfs"
                target="_blank"
              >{{ $t("passport.openIpfs") }}</a>
              <div class="print-show">Link in IPFS: {{image.hash | urlIpfs}}</div>
            </div>
          </div>
        </section>
      </section>
      <hr class="ptint-hidden" />
      <div class="icons-line ptint-hidden">
        <a class="i-print" href="#" title="Print Passport" onclick="window.print();return false;"></a>
        <a class="i-twitter" :href="getLinkTwitter()" title="Tweet"></a>
        <a class="i-share" href="javascript:;" title="Share the link" v-clipboard:copy="getLink()"></a>
      </div>
    </template>
    <div v-else class="loader">
      <RLoader />&nbsp;
      <b class="align-vertical t-style_uppercase">{{ $t("passport.loading") }}</b>
    </div>
  </fragment>
</template>

<script>
import axios from "axios";
import { Liability } from "robonomics-js";
import iconv from "iconv-lite";
import { readRosbagIpfs } from "../../utils/utils";
import config from "~config";

function loadScript(src) {
  return new Promise(function(resolve, reject) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default {
  props: ["address"],
  data() {
    return {
      passport: null,
      json: null,
      loadJson: false,
      viewMeta: false,
      viewImages: false
    };
  },
  created() {
    const liability = new Liability(
      this.$robonomics.web3,
      this.address,
      this.address
    );
    liability.getInfo().then(info => {
      this.rosbagObjective(info.objective);
    });
  },
  mounted() {
    loadScript("https://platform.twitter.com/widgets.js");
  },
  computed: {
    metaSlice: function() {
      return (
        this.passport.meta.slice(0, 6) + "..." + this.passport.meta.slice(-4)
      );
    }
  },
  methods: {
    rosbagObjective(hash) {
      const passport = {};
      readRosbagIpfs(hash, bag => {
        if (bag.message.data === "") {
          return;
        }
        const topic = bag.topic.replace(/\//, "");
        if (topic === "images") {
          if (!passport[topic]) {
            passport[topic] = [];
          }
          const hash = iconv.decode(
            Buffer.from(bag.message.data, "ascii"),
            "utf-8"
          );
          passport[topic].push({
            hash,
            sliceHash: hash.slice(0, 6) + "..." + hash.slice(-4),
            show: false
          });
        } else {
          passport[topic] = iconv.decode(
            Buffer.from(bag.message.data, "ascii"),
            "utf-8"
          );
        }
      }).then(() => {
        this.passport = passport;
      });
    },
    view(hash) {
      this.viewMeta = !this.viewMeta;
      if (!this.loadJson && this.json === null) {
        this.loadJson = true;
        axios
          .get(`${config.IPFS_GATEWAY}${hash}`)
          .then(r => {
            this.json = r.data;
            this.loadJson = false;
          })
          .catch(() => {
            this.loadJson = false;
          });
      }
    },
    getLink() {
      return `${window.location.origin}/${
        this.$router.resolve({
          name: "passport-view",
          params: {
            passport: this.address
          }
        }).href
      }`;
    },
    getLinkTwitter() {
      return `https://twitter.com/intent/tweet?text=${window.encodeURIComponent(
        this.getLink()
      )}&ref_src=twsrc%5Etfw`;
    }
  }
};
</script>
