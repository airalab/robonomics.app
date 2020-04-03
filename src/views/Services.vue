<template>
  <Page>
    <h1>{{ $t("services.title") }}</h1>
    <section class="flex-grid">
      <RCard
        v-for="(service, index) in services"
        :key="index"
        class="item"
        :class="{ disabled: service.disabled }"
      >
        <a v-if="service.target" :href="service.link" target="_blank" class="item-avatar">
          <span class="item-avatar--image" :style="`background-image: url('${service.img}');`"></span>
        </a>
        <router-link v-else :to="service.link" class="item-avatar">
          <span class="item-avatar--image" :style="`background-image: url('${service.img}');`"></span>
        </router-link>
        <div class="item-content">
          <h2>
            <a
              v-if="service.target"
              :href="service.link"
              target="_blank"
            >{{ service[$i18n.locale].name }}</a>
            <router-link v-else :to="service.link">{{ service[$i18n.locale].name }}</router-link>
          </h2>
          <div class="t-hyphen">{{ service[$i18n.locale].desc }}</div>
          <div class="item-bottom">
            <div class="item-bottom--line">
              <span>Provider:</span>
              <span class="item-bottom--info" v-for="(item, i) in service.by" :key="i">
                <a v-if="item.link" :href="item.link" target="_blank">{{ item.label }}</a>
                <template v-else>{{ item.label }}</template>
                <template v-if="i != (service.by.length - 1)">,&nbsp;</template>
              </span>
            </div>
            <div v-if="service.token" class="item-bottom--line">
              <span>Payment token:</span>
              <span class="item-bottom--info">{{ service.token.name }}</span>
            </div>
          </div>
        </div>
      </RCard>
    </section>
  </Page>
</template>

<script>
import { mapState } from "vuex";
import Page from "@/components/layout/Page";
import services from "../services";

export default {
  components: { Page },
  data() {
    return {
      services: [
        ...Object.values(services)
          .filter(item => item.meta)
          .map(item => item.meta)
      ]
    };
  },
  computed: {
    ...mapState("chain", ["networkId"])
  },
  created() {
    document.title = `${this.$t("services.title")} – Robonomics Network dApp`;
  }
};
</script>
