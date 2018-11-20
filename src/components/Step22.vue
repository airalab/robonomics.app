<template>
  <div>
    <h2>2. YOUR ACCOUNT</h2>
    <section class="sec-white">
      <div class="d-t">
        <div class="d-t_cell">
          Your balance: <b>{{ balance.valueStr }}</b>
        </div>
      </div>
      <div class="d-t">
        <div class="d-t_cell">
          Your allowed for trade: <b>{{ approveTrade.valueStr }}</b>
        </div>
        <div class="d-t_cell">
          <button
            v-on:click="sendApproveTrade"
            v-if="approveTrade.show"
            :disabled="approveTrade.disabled"
          >
            {{ approveTrade.text }}
          </button>
        </div>
      </div>
      <div class="d-t">
        <div class="d-t_cell">
          Your allowed for worker: <b>{{ approveWorker.valueStr }}</b>
        </div>
        <div class="d-t_cell">
          <button
            v-on:click="sendApproveWorker"
            v-if="approveWorker.show"
            :disabled="approveWorker.disabled"
          >
            {{ approveWorker.text }}
          </button>
          <button
            v-on:click="sendRefill"
            v-if="refill.show"
            :disabled="refill.disabled"
          >
            {{ refill.text }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import getRobonomics from '../utils/robonomics';
import bus from '../utils/bus';
import { formatDecimals, watchTx } from '../utils/utils';

let robonomics;

export default {
  name: 'Step22',
  data() {
    return {
      minimalFreeze: 1000,
      balance: {
        value: 0,
        valueStr: '0 XRT',
      },
      approveTrade: {
        value: 0,
        valueStr: '0 XRT',
        show: true,
        disabled: true,
        text: 'Approve',
      },
      approveWorker: {
        value: 0,
        valueStr: '0 XRT',
        show: true,
        disabled: true,
        text: 'Approve',
      },
      refill: {
        show: false,
        disabled: false,
        text: 'Refill',
      },
    };
  },
  created() {
    robonomics = getRobonomics();
    this.fetchData();
  },
  methods: {
    fetchData() {
      robonomics.ready().then(() => {
        robonomics.lighthouse.call('minimalFreeze')
          .then((r) => {
            this.minimalFreeze = Number(r);
            return robonomics.xrt.call('balanceOf', [robonomics.account]);
          })
          .then((balanceOf) => {
            this.balance.value = balanceOf;
            this.balance.valueStr = `${formatDecimals(balanceOf, 9)} XRT`;
            if (balanceOf > 0) {
              robonomics.xrt.call('allowance', [robonomics.account, robonomics.factory.address])
                .then((allowance) => {
                  this.approveTrade.value = allowance;
                  this.approveTrade.valueStr = `${formatDecimals(allowance, 9)} XRT`;
                  if (allowance <= 0) {
                    this.approveTrade.disabled = false;
                    this.approveTrade.text = 'Approve';
                  } else {
                    this.approveTrade.disabled = true;
                    this.approveTrade.text = 'Approved';
                    this.$parent.$emit('approve', true);
                  }
                });
            }
            if (balanceOf >= this.minimalFreeze) {
              robonomics.xrt.call('allowance', [robonomics.account, robonomics.lighthouse.address])
                .then((allowance) => {
                  this.approveWorker.value = allowance;
                  this.approveWorker.valueStr = `${formatDecimals(allowance, 9)} XRT`;
                  if (allowance >= this.minimalFreeze) {
                    this.approveWorker.show = false;
                    this.approveWorker.disabled = true;
                    this.approveWorker.text = 'Approved';

                    this.refill.show = true;
                    this.refill.disabled = false;
                    this.refill.text = 'Refill';
                  } else {
                    this.approveWorker.show = true;
                    this.approveWorker.disabled = false;
                    this.approveWorker.text = 'Approve';

                    this.refill.show = false;
                    this.refill.disabled = true;
                    this.refill.text = 'Refill';
                  }
                });
            } else {
              this.approveWorker.disabled = true;
              this.approveWorker.text = 'Approve';
            }
          });
      });
    },
    sendApproveTrade() {
      robonomics.xrt.send('approve', [robonomics.factory.address, 1000000000], { from: robonomics.account })
        .then((r) => {
          this.approveTrade.disabled = true;
          this.approveTrade.text = '...';
          return watchTx(r);
        })
        .then(() => {
          this.approveTrade.text = 'Approved';
          this.fetchData();
          this.$parent.$emit('approve', true);
        });
    },
    sendApproveWorker() {
      robonomics.xrt.send('approve', [robonomics.lighthouse.address, this.minimalFreeze], { from: robonomics.account })
        .then((r) => {
          this.approveWorker.disabled = true;
          this.approveWorker.text = '...';
          return watchTx(r);
        })
        .then(() => {
          this.approveWorker.text = 'Approved';
          this.fetchData();
        });
    },
    sendRefill() {
      robonomics.lighthouse.send('refill', [this.minimalFreeze], { from: robonomics.account })
        .then((r) => {
          this.refill.disabled = true;
          this.refill.text = '...';
          return watchTx(r);
        })
        .then(() => {
          this.refill.text = 'Ok';
          this.fetchData();
          bus.$emit('updStep21');
        });
    },
  },
};
</script>
