<template>
  <div class="sidebar flexcols">
    <div class="sidebar-col sidebar-col--sm">
      <div class="sidebar-col-in">
        <section>
          <router-link to="/">
            <img alt="dApp logo" src="assets/i/logo-dapp-sign.svg" />
          </router-link>
        </section>
        <section>
          <a class="sidebar-i--lg js-sidebar-link" href="javascript:;" on-toggle="#sidebar-nav1">
            <i class="i-menu"></i>
          </a>
          <a
            class="sidebar-i--lg js-sidebar-link"
            href="javascript:;"
            on-toggle="#sidebar-lang"
          >{{$i18n.locale.toUpperCase()}}</a>
          <a class="sidebar-i--lg js-sidebar-link" href="javascript:;" on-toggle="#sidebar-theme">
            <i class="i-day"></i>
          </a>
        </section>
        <section class="sidebar-col--bottom">
          <a class="sidebar-i--lg js-sidebar-link" href="javascript:;" on-toggle="#sidebar-info">?</a>
        </section>
      </div>
    </div>
    <div class="sidebar-col js-sidebar-content" id="sidebar-nav1">
      <div class="sidebar-col-in">
        <section>
          <a href="/">
            <img class="theme-day" alt="dApp logo" src="assets/i/logo-dapp-text-blue.svg" />
            <img class="theme-night" alt="dApp logo" src="assets/i/logo-dapp-text.svg" />
          </a>
        </section>
        <section>
          <nav class="nav-vertical">
            <router-link to="/" active-class="active" exact>
              <span class="i-piechart align-vertical"></span>
              <span class="align-vertical">{{ $t('net_stats') }}</span>
            </router-link>
            <router-link to="/lighthouse" active-class="active">
              <span class="i-lighthouse align-vertical"></span>
              <span class="align-vertical">{{ $t('lighthouse') }}</span>
            </router-link>
            <router-link v-if="networkId === 1" to="/alembic" active-class="active" exact>
              <span class="i-transfer align-vertical"></span>
              <span class="align-vertical">{{ $t('tokens_alembic') }}</span>
            </router-link>
          </nav>
        </section>
      </div>
    </div>
    <div class="sidebar-col sidebar-col-padding js-sidebar-content" id="sidebar-lang">
      <div class="sidebar-col-in">
        <section>
          <LangSwitcher :loadContent="loadContent" />
        </section>
      </div>
    </div>
    <div class="sidebar-col sidebar-col-padding js-sidebar-content" id="sidebar-theme">
      <div class="sidebar-col-in">
        <section>
          <nav class="nav-vertical">
            <a
              :class="{active: theme === 'light'}"
              href="#"
              @click="$store.dispatch('theme/setTheme', 'light')"
            >
              <span class="i-day align-vertical"></span>
              <span class="align-vertical">Light</span>
            </a>
            <a
              :class="{active: theme === 'dark'}"
              href="#"
              @click="$store.dispatch('theme/setTheme', 'dark')"
            >
              <span class="i-night align-vertical"></span>
              <span class="align-vertical">Dark</span>
            </a>
          </nav>
        </section>
      </div>
    </div>
    <div class="sidebar-col sidebar-col-padding js-sidebar-content" id="sidebar-info">
      <div class="sidebar-col-in">
        <section>
          <nav class="nav-vertical">
            <a href="https://github.com/airalab" target="_blank">
              <span class="i-github align-vertical"></span>
              <span class="align-vertical">Github</span>
            </a>
            <a href="https://www.reddit.com/r/robonomics/" target="_blank">
              <span class="i-reddit align-vertical"></span>
              <span class="align-vertical">Reddit</span>
            </a>
            <a href="https://robonomics.network/" target="_blank">
              <span class="i-cursor align-vertical"></span>
              <span class="align-vertical">robonomomics.network</span>
            </a>
            <a href="https://aira.life/" target="_blank">
              <span class="i-cursor align-vertical"></span>
              <span class="align-vertical">aira.life</span>
            </a>
          </nav>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Web3Check from "vue-web3-check";
import LangSwitcher from "./LangSwitcher";

export default {
  props: ["loadContent"],
  components: {
    LangSwitcher
  },
  data() {
    return {
      networkId: 0
    };
  },
  computed: {
    ...mapState("theme", ["theme"])
  },
  mounted() {
    window.init();
    this.networkId = Web3Check.store.state.networkId;
  }
};
</script>
