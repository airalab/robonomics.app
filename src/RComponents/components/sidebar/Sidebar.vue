<template>
  <div class="sidebar flexcols">
    <div class="sidebar-col sidebar-col--sm">
      <div class="sidebar-col-in">
        <section>
          <slot name="icon"></slot>
        </section>
        <section>
          <Button
            v-for="(item, k) in Object.values(blocks.top)"
            :key="k"
            :icon="item.icon"
            :label="item.label"
            :isActive="block == item.id"
            @toggle="toggle(item.id)"
          />
          <Button
            v-if="isLanguage"
            :label="$i18n.locale.toUpperCase()"
            :isActive="block == 'lang'"
            @toggle="toggle('lang')"
          />
          <ThemeSwitcher v-if="isTheme" />
        </section>
        <section class="sidebar-col--bottom">
          <Button
            v-for="(item, k) in Object.values(blocks.bottom)"
            :key="k"
            :icon="item.icon"
            :label="item.label"
            :isActive="block == item.id"
            @toggle="toggle(item.id)"
          />
        </section>
      </div>
    </div>
    <div
      class="sidebar-col sidebar-col-padding"
      :class="{ open: !!block }"
      v-show="!!block"
    >
      <div class="sidebar-col-in">
        <LangSwitcher v-if="isLanguage" v-show="block == 'lang'" />
        <div
          v-for="(item, k) in [
            ...Object.values(blocks.top),
            ...Object.values(blocks.bottom)
          ]"
          :key="`block-${k}`"
          v-show="block == item.id"
        >
          <component v-bind:is="item.component"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Button from "./Button";
import ThemeSwitcher from "./ThemeSwitcher";
import LangSwitcher from "./LangSwitcher";

export default {
  props: {
    isTheme: {
      type: Boolean,
      default: true
    },
    isLanguage: {
      type: Boolean,
      default: true
    }
  },
  components: {
    Button,
    LangSwitcher,
    ThemeSwitcher
  },
  data() {
    return {
      block: null,
      blocks: {
        top: {},
        bottom: {}
      }
    };
  },
  created() {
    this.items();
  },
  beforeUpdate() {
    this.items();
  },
  methods: {
    items() {
      const slots = this.$slots.default || [];
      slots.forEach((item, i) => {
        const type = Object.prototype.hasOwnProperty.call(
          item.data.attrs,
          "bottom"
        )
          ? "bottom"
          : "top";
        this.blocks[type][type + "-" + i] = {
          id: type + "-" + i,
          label: item.data.attrs.label,
          icon: item.data.attrs.icon,
          component: Vue.component("component-" + i, {
            render() {
              return item;
            }
          })
        };
      });
    },
    toggle(block) {
      if (this.block === block) {
        this.block = null;
      } else {
        this.block = block;
      }
    }
  }
};
</script>
