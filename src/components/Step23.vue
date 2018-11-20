<template>
  <div>
    <h2>3. TRY LIGHTHOUSE</h2>
    <section class="sec-white step-2-actions">
      <div class="d-t secw-full">
        <div class="d-t_cell">
          <img class="img-block" alt="" src="static/assets/i/step-2-demand.jpg"
            srcset="static/assets/i/step-2-demand@2x.jpg" />
          <button v-on:click="sendMsgDemand">SEND A DEMAND</button>
        </div>
        <div class="d-t_cell">
          <img class="img-block" alt="" src="static/assets/i/step-2-offer.jpg"
            srcset="static/assets/i/step-2-offer@2x.jpg">
          <button v-on:click="sendMsgOffer">SEND AN OFFER</button>
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
    sendMsgDemand() {
      web3.eth.getBlock('latest', (e, r) => {
        const demand = {
          objective: OBJECTIVE,
          token: robonomics.xrt.address,
          cost: 1,
          lighthouse: '0x0000000000000000000000000000000000000000',
          validator: '0x0000000000000000000000000000000000000000',
          validatorFee: 0,
          deadline: r.number + 1000,
        };
        robonomics.postDemand(this.market, demand)
          .then((liability) => {
            console.log('liability demand', liability.address);
          });
      });
    },
    sendMsgOffer() {
      web3.eth.getBlock('latest', (e, r) => {
        const offer = {
          objective: OBJECTIVE,
          token: robonomics.xrt.address,
          cost: 1,
          validator: '0x0000000000000000000000000000000000000000',
          lighthouse: '0x0000000000000000000000000000000000000000',
          lighthouseFee: 1,
          deadline: r.number + 1000,
        };
        robonomics.postOffer(this.market, offer)
          .then((liability) => {
            console.log('liability offer', liability.address);
          });
      });
    },
  },
};
</script>
