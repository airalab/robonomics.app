<template>
  <div>
    <div class="secw-narrow">
        <h2>4. WATCH MARKET</h2>
    </div>
    <div class="secw-base step-2-market">
      <section class="sec-white">
        <div class="row">
          <div class="col-md-4">
            <h3>DEMAND</h3>
            <div>
              <p class="t-break" v-for="(item, i) in asks" :key="i">
                <b>account: </b>{{ item.account }}<br/>
                <b>model: </b>{{ item.model }}<br/>
                <b>objective: </b>{{ item.objective }}<br/>
                <b>token: </b>{{ item.token }}<br/>
                <b>cost: </b>{{ item.cost }}<br/>
                <b>count: </b>{{ item.count }}<br/>
                <b>validatorFee: </b>{{ item.validatorFee }}<br/>
                <b>deadline: </b>{{ item.deadline }}
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <h3>OFFER</h3>
            <div>
              <p class="t-break" v-for="(item, i) in bids" :key="i">
                <b>account: </b>{{ item.account }}<br/>
                <b>model: </b>{{ item.model }}<br/>
                <b>token: </b>{{ item.token }}<br/>
                <b>cost: </b>{{ item.cost }}<br/>
                <b>count: </b>{{ item.count }}<br/>
                <b>lighthouseFee: </b>{{ item.lighthouseFee }}<br/>
                <b>deadline: </b>{{ item.deadline }}
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <h3>LIABILITIES</h3>
            <div>
              <p class="t-break" v-for="(item, i) in lis" :key="i">
                <a :href="`https://kovan.etherscan.io/address/${item.address}`" target="_blank">{{ item.address }}</a><br/>
                <b>lighthouse: </b><a :href="`https://kovan.etherscan.io/address/${item.lighthouse}`" target="_blank">{{ item.lighthouse }}</a><br/>
                <b>from: </b><a :href="`https://kovan.etherscan.io/address/${item.from}`" target="_blank">{{ item.from }}</a><br/>
                <b>model: </b>{{ item.model }}<br/>
                <b>objective: </b>{{ item.objective }}<br/>
                <b>token: </b>{{ item.token }}<br/>
                <b>promisee: </b>{{ item.promisee }}<br/>
                <b>promisor: </b>{{ item.promisor }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import find from 'lodash/find';
import robonomics, { getChanel } from '../utils/robonomics';

let chanel;

export default {
  name: 'Step24',
  data() {
    return {
      lighthouse: '',
      asks: [],
      bids: [],
      lis: [],
    };
  },
  created() {
    this.lighthouse = this.$route.params.lighthouse;
    chanel = getChanel(this.$route.params.lighthouse);
    this.fetchData();
  },
  methods: {
    fetchData() {
      robonomics.factory.watchLiability((liability, result) => {
        web3.eth.getTransaction(result.transactionHash, (e, r) => {
          if (r.to.toLowerCase() === this.lighthouse.toLowerCase()) {
            liability.getInfo()
              .then((info) => {
                if (!find(this.lis, { address: liability.address })) {
                  this.lis = [
                    { lighthouse: r.to, from: r.from, address: liability.address, ...info },
                    ...this.lis];
                }
              });
          }
        });
      });

      chanel.asks((msg) => {
        const acc = msg.recover();
        this.asks = [{ ...msg, account: acc }, ...this.asks];
      });

      chanel.bids((msg) => {
        const acc = msg.recover();
        this.bids = [{ ...msg, account: acc }, ...this.bids];
      });
    },
  },
};
</script>
