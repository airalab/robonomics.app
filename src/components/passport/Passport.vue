<template>
  <fragment>
    <section>
      <div class="form-item form-line-label">
        <label>{{ $t("passport.liability") }}</label>
        <RLinkExplorer :text="address" />
      </div>
    </section>
    <section v-if="passport">
      <div class="form-section-title">{{ $t("passport.subtitle1") }}</div>
      <div class="form-item form-line-label">
        <label>{{ $t("passport.email") }}</label>
        <div>{{ passport.email }}</div>
      </div>
      <div class="form-item form-line-label">
        <label>{{ $t("passport.info") }}</label>
        <div>{{ passport.info }}</div>
      </div>
      <template v-if="passport.meta || passport.images">
        <div class="form-section-title">{{ $t("passport.subtitle2") }}</div>
        <div v-if="passport.meta" class="form-item form-line-label">
          <label>{{ $t("passport.meta") }}</label>
          <RLinkExplorer type="ipfs" :text="passport.meta" />
          <RButton v-if="json === null" @click.native="view(passport.meta)">view</RButton>
          <pre
            v-if="json"
            style="max-height: 200px;overflow: scroll;border: 1px solid #eee;padding: 10px;color: crimson;font-size: 12px;"
          >{{json}}</pre>
        </div>
        <div v-if="passport.images" class="form-item form-line-label">
          <label>{{ $t("passport.images") }}</label>
          <div v-for="(image, key) in passport.images" :key="key">
            <RCard>
              <RImgHover :href="image | urlIpfs" :src="image | urlIpfs" />
              <RLinkExplorer type="ipfs" :text="image" />
            </RCard>
          </div>
        </div>
      </template>
    </section>
    <div v-else class="loader">
      <RLoader />&nbsp;
      <b class="align-vertical t-style_uppercase">Loading</b>
    </div>
  </fragment>
</template>

<script>
import axios from "axios";
import { Liability } from "robonomics-js";
import iconv from "iconv-lite";
import { readRosbagIpfs } from "../../utils/utils";
import config from "~config";

export default {
  props: ["address"],
  data() {
    return {
      passport: null,
      json: null
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
          passport[topic].push(
            iconv.decode(Buffer.from(bag.message.data, "ascii"), "utf-8")
          );
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
      axios.get(`${config.IPFS_GATEWAY}${hash}`).then(r => {
        this.json = r.data;
        console.log(this.json);
      });
    }
  }
};
</script>
