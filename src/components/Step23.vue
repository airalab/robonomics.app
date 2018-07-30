<template>
  <div>
    <h2>3. TRY LIGHTHOUSE</h2>
    <section class="sec-white step-2-actions">
      <div class="d-t secw-full">
        <div class="d-t_cell">
          <img class="img-block" alt="" src="static/assets/i/step-2-demand.jpg"
            srcset="static/assets/i/step-2-demand@2x.jpg" />
          <button v-on:click="sendMsgAsk">SEND A DEMAND</button>
        </div>
        <div class="d-t_cell">
          <img class="img-block" alt="" src="static/assets/i/step-2-offer.jpg"
            srcset="static/assets/i/step-2-offer@2x.jpg">
          <button v-on:click="sendMsgBid">SEND AN OFFER</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import getRobonomics from '../utils/robonomics';
import { MARKET_MODEL, OBJECTIVE } from '../config';

let robonomics;

export default {
  name: 'Step23',
  data() {
    return {
      market: MARKET_MODEL,
    };
  },
  created() {
    robonomics = getRobonomics();
    robonomics.ready().then(() => {
      console.log('ready');
    });
  },
  methods: {
    sendMsgAsk() {
      web3.eth.getBlock('latest', (e, r) => {
        const ask = {
          objective: OBJECTIVE,
          token: robonomics.xrt.address,
          cost: 1,
          validator: '0x0000000000000000000000000000000000000000',
          validatorFee: 0,
          deadline: r.number + 1000,
        };
        robonomics.postAsk(this.market, ask)
          .then((liability) => {
            console.log('liability ask', liability.address);
          });
      });
    },
    sendMsgBid() {
      web3.eth.getBlock('latest', (e, r) => {
        const bid = {
          objective: OBJECTIVE,
          token: robonomics.xrt.address,
          cost: 1,
          lighthouseFee: 1,
          deadline: r.number + 1000,
        };
        robonomics.postBid(this.market, bid)
          .then((liability) => {
            console.log('liability bid', liability.address);
          });
      });
    },
  },
};
</script>
