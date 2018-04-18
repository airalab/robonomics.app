<template>
  <div>
    <h2>2. YOUR ACCOUNT</h2>
    <section class="sec-white">
      <div class="d-t">
        <div class="d-t_cell">Your balance: <b>{{ myBalance }}</b></div>
        <div class="d-t_cell">
          <a href="https://robonomics.network/faucet/" target="_blank" v-if="isFaucet">
            Get XRT in faucet
          </a>
          <button v-on:click="sendApprove" v-if="approve.show" :disabled="approve.dis">
            {{ approve.text }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import aira from '../utils/aira';

const formatDecimals = (price, decimals) => {
  const priceNum = new web3.BigNumber(price);
  return priceNum.shift(-decimals).toNumber();
};

const watchTx = (tx) => {
  const transactionReceiptAsync = (resolve, reject) => {
    web3.eth.getTransactionReceipt(tx, (error, receipt) => {
      if (error) {
        reject(error);
      } else if (receipt === null) {
        setTimeout(() => transactionReceiptAsync(resolve, reject), 5000);
      } else {
        resolve(receipt);
      }
    });
  };
  if (Array.isArray(tx)) {
    return Promise.all(tx.map(oneTx => watchTx(oneTx)));
  } else if (typeof tx === 'string') {
    return new Promise(transactionReceiptAsync);
  }
  throw new Error(`Invalid Type: ${tx}`);
};

export default {
  name: 'Step22',
  data() {
    return {
      myBalance: 0,
      isFaucet: false,
      approve: {
        show: true,
        dis: false,
        text: 'Approve',
      },
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      aira.xrt.call('balanceOf', [web3.eth.accounts[0]])
        .then((balanceOf) => {
          this.myBalance = `${formatDecimals(balanceOf, 9)} XRT`;
          if (balanceOf <= 0) {
            this.isFaucet = true;
          } else {
            aira.xrt.call('allowance', [web3.eth.accounts[0], aira.address.factory])
              .then((allowance) => {
                if (allowance <= 0) {
                  this.approve.show = true;
                  this.approve.dis = false;
                  this.approve.text = 'Approve';
                } else {
                  this.approve.show = true;
                  this.approve.dis = true;
                  this.approve.text = 'Approved';
                  this.$parent.$emit('approve', true);
                }
              });
          }
        });
    },
    sendApprove() {
      aira.xrt.send('approve', [aira.address.factory, 1000000000], { from: web3.eth.accounts[0] })
        .then((r) => {
          this.approve.show = true;
          this.approve.dis = true;
          this.approve.text = '...';
          return watchTx(r);
        })
        .then(() => {
          this.approve.show = true;
          this.approve.dis = true;
          this.approve.text = 'Approved';
          this.$parent.$emit('approve', true);
        });
    },
  },
};
</script>
