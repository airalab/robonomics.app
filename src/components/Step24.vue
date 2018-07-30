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
                <b>objective: </b>{{ item.objective }}<br/>
                <b>token: </b>{{ item.token }}<br/>
                <b>cost: </b>{{ item.cost }}<br/>
                <b>lighthouseFee: </b>{{ item.lighthouseFee }}<br/>
                <b>deadline: </b>{{ item.deadline }}
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <h3>LIABILITIES</h3>
            <div>
              <p class="t-break" v-for="(item, i) in lis" :key="i">
                <a :href="`https://etherscan.io/address/${item.address}`" target="_blank">{{ item.address }}</a><br/>
                <b>lighthouse: </b><a :href="`https://etherscan.io/address/${item.lighthouse}`" target="_blank">{{ item.lighthouse }}</a><br/>
                <b>worker: </b><a :href="`https://etherscan.io/address/${item.worker}`" target="_blank">{{ item.worker }}</a><br/>
                <b>model: </b>{{ item.model }}<br/>
                <b>objective: </b>{{ item.objective }}<br/>
                <b>token: </b>{{ item.token }}<br/>
                <b>cost: </b>{{ item.cost }}<br/>
                <b>promisee: </b>{{ item.promisee }}<br/>
                <b>promisor: </b>{{ item.promisor }}<br/>
                <span v-if="item.promisor == account && item.result == ''">
                  <button v-on:click="postResult(item.address)">post result</button>
                </span>
                <span v-if="item.result != ''">
                  <b>Results: </b>{{ item.result }}
                </span>
                <span v-if="item.result == ''">
                  <b>Results: </b>...
                </span>
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
import findIndex from 'lodash/findIndex';
import getRobonomics from '../utils/robonomics';
import { MARKET_MODEL, RESULT } from '../config';

let robonomics;

export default {
  name: 'Step24',
  data() {
    return {
      account: '',
      market: MARKET_MODEL,
      asks: [],
      bids: [],
      lis: {},
    };
  },
  created() {
    robonomics = getRobonomics();
    robonomics.ready().then(() => {
      this.fetchData();
    });
  },
  methods: {
    fetchData() {
      robonomics.ready().then(() => {
        this.account = robonomics.account;
        robonomics.getBid(this.market, (msg) => {
          console.log(msg);
          this.bids = [{ ...msg }, ...this.bids.slice(0, 20)];
        });
        robonomics.getAsk(this.market, (msg) => {
          console.log(msg);
          this.asks = [{ ...msg }, ...this.asks.slice(0, 20)];
        });
        robonomics.watchLiability(this.market, (liability) => {
          liability.getInfo()
            .then((info) => {
              const item = find(this.lis, { address: liability.address });
              if (!item) {
                this.lis = [
                  {
                    address: liability.address,
                    lighthouse: liability.lighthouse,
                    worker: liability.worker,
                    ...info,
                  },
                  ...this.lis,
                ];
                liability.watchResult((result) => {
                  console.log('result', result);
                  const i = findIndex(this.lis, { address: liability.address });
                  this.lis[i] = { ...this.lis[i], result };
                  this.lis = { ...this.lis };
                });
              }
            });
        });
      });
    },
    postResult(liability) {
      robonomics.postResult({ liability, result: RESULT })
        .then(() => {
          console.log('ok');
        });
    },
  },
};
</script>
