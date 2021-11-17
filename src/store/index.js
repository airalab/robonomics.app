import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
import providers from "./modules/providers";
import tokens from "./modules/tokens";

Vue.use(Vuex);

const debug = false;

export default new Vuex.Store({
  modules: {
    providers,
    tokens
  },
  strict: true, // debug,
  plugins: debug ? [createLogger()] : []
});
