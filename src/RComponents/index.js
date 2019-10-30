import * as components from './components';
import * as filters from './tools/filters';
import initIpfs, * as ipfs from './tools/ipfs';
import initRobonomics, * as robonomics from './tools/robonomics';
import { setConfig } from './config';

export { components, filters, initIpfs, ipfs, initRobonomics, robonomics };

export default {
  install(Vue, options) {
    setConfig(options);
    for (const key in components) {
      const component = components[key];
      Vue.component('R' + key, component);
    }
  }
};
