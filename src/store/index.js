import Vue from "vue";
import Vuex from "vuex";
import createLogger from "vuex/dist/logger";
import statistics from "./modules/statistics";
import net from "./modules/net";
import providers from "./modules/providers";
import tokens from "./modules/tokens";
import chain from "./modules/chain";

Vue.use(Vuex);

const debug = false;

export default new Vuex.Store({
  modules: {
    statistics,
    net,
    providers,
    tokens,
    chain
  },
  strict: true, // debug,
  plugins: debug ? [createLogger()] : []
});
