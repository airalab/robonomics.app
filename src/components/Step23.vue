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
import Promise from 'bluebird';
import aira, { getChanel } from '../utils/aira';

const signer = (account, hash) => Promise.promisify(web3.eth.sign)(account, hash);
const message = aira.message(signer);

const ask = message.create({
  // model: 'auto',
  // objective: 'red',
  model: 'QmfCcLKrTCuXsf6bHbVupVv4zsbs6kjqTQ7DRftGqMLjdW',
  objective: 'Qmbdan31EbgETmJU79shwQDHcMgNoRS6RMGDNJZNp8FLCS',
  token: aira.address.xrt,
  cost: 1,
  count: 1,
  validator: '0x0000000000000000000000000000000000000000',
  validatorFee: 0,
  deadline: 45646546,
});

const bid = message.create({
  // model: 'auto',
  model: 'QmfCcLKrTCuXsf6bHbVupVv4zsbs6kjqTQ7DRftGqMLjdW',
  token: aira.address.xrt,
  cost: 1,
  count: 1,
  lighthouseFee: 0,
  deadline: 45646546,
});

let chanel;

export default {
  name: 'Step23',
  created() {
    chanel = getChanel(this.$route.params.lighthouse);
  },
  methods: {
    sendMsgAsk() {
      web3.eth.getBlock('latest', (e, r) => {
        ask.deadline = r.number + 1000;
        message.sign(web3.eth.accounts[0], ask)
          .then(() => chanel.push(ask));
      });
    },
    sendMsgBid() {
      web3.eth.getBlock('latest', (e, r) => {
        bid.deadline = r.number + 1000;
        message.sign(web3.eth.accounts[0], bid)
          .then(() => chanel.push(bid));
      });
    },
  },
};
</script>
