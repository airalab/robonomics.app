import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import theme from './modules/theme';
import kyc from './modules/kyc';
import token from './modules/token';
import statistics from './modules/statistics';
import net from './modules/net';
import messages from './modules/messages';
import providers from './modules/providers';
import sender from './modules/sender';

Vue.use(Vuex);

const debug = false;

export default new Vuex.Store({
  modules: {
    theme,
    kyc,
    token,
    statistics,
    net,
    messages,
    providers,
    sender
  },
  strict: true, // debug,
  plugins: debug ? [createLogger()] : []
});
