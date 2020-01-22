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
      <div class="form-section-title">{{ $t("passport.subtitle2") }}</div>
      <div class="form-item form-line-label">
        <label>{{ $t("passport.meta") }}</label>
        <RLinkExplorer type="ipfs" :text="passport.meta" />
      </div>
      <div class="form-item form-line-label">
        <label>{{ $t("passport.images") }}</label>
        <div v-for="(image, key) in passport.images" :key="key">
          <RLinkExplorer type="ipfs" :text="image" />
        </div>
      </div>
    </section>
  </fragment>
</template>

<script>
import { Liability } from "robonomics-js";
import iconv from "iconv-lite";
import { readRosbagIpfs } from "../../utils/utils";

export default {
  props: ["address"],
  data() {
    return {
      passport: null
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
        // console.log(passport);
        this.passport = passport;
      });
    }
  }
};
</script>
