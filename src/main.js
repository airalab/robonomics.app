/* eslint-disable no-new */
/* eslint global-require: 0 */
import Vue from 'vue';
import NotWeb3 from './components/NotWeb3';
import DepNetwork from './components/DepNetwork';
import NotAccounts from './components/NotAccounts';

const startApp = () => {
  require('./app.js');
};
const notWeb3 = () => {
  new Vue({
    el: '#app',
    components: { NotWeb3 },
    template: '<NotWeb3/>',
  });
};
const depNetwork = () => {
  new Vue({
    el: '#app',
    components: { DepNetwork },
    template: '<DepNetwork/>',
  });
};
const notAccounts = () => {
  new Vue({
    el: '#app',
    components: { NotAccounts },
    template: '<NotAccounts/>',
  });
};
const canNetwork = () => {
  web3.version.getNetwork((e, r) => {
    if (Number(r) === 42) {
      startApp();
    } else {
      depNetwork();
    }
  });
};

const listeningChangeAccount = () => {
  let [account] = web3.eth.accounts;
  const accountInterval = () => {
    if (web3.eth.accounts.length <= 0 && account !== undefined) {
      account = undefined;
      notAccounts();
    } else if (web3.eth.accounts[0] !== account) {
      [account] = web3.eth.accounts;
      canNetwork();
    }
    setTimeout(() => {
      accountInterval();
    }, 1000);
  };
  accountInterval();
};

window.addEventListener('load', () => {
  if (typeof web3 !== 'undefined') {
    if (web3.eth.accounts.length > 0) {
      canNetwork();
    } else if (web3.eth.accounts.length <= 0) {
      notAccounts();
    }
    listeningChangeAccount();
  } else {
    notWeb3();
  }
});
