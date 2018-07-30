<template>
  <div>
    <h2>1. LIGHTHOUSE INFO</h2>
    <section class="sec-white">
      <table>
        <tbody>
          <tr>
            <td>contract of lighthouse</td>
            <td>balance</td>
            <td>workers</td>
            <td>status</td>
          </tr>
          <tr>
            <td>
              <p class="t-break">
                {{ this.$route.params.lighthouse }}<br />
                <small>{{ lighthouse }}</small>
              </p>
            </td>
            <td style="text-align: center;">{{ lighthouseBalance }}</td>
            <td style="text-align: center;">
              {{ members.length }}<br />
              <toggle-button
                v-model="showWorkers"
                :labels="{checked: 'Hide', unchecked: 'Show'}"
                :width="55" />
            </td>
            <td style="text-align: center;">
              <template v-if="timeoutBlocks < currentBlock - keepaliveBlock">
                <span class="snooze">Z</span>
              </template>
              <template v-else>
                work
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    <section class="sec-white" v-if="showWorkers">
      <table>
        <tbody>
          <tr>
            <td>#</td>
            <td>worker</td>
            <td>quota</td>
            <td>balance</td>
          </tr>
          <tr v-for="member in members" :key="member.i">
            <template v-if="member.i == marker">
              <td style="text-align: center;">&rarr; {{ member.i }}</td>
              <td><small class="activeMember">{{ member.address }}</small></td>
              <td style="text-align: center;">
                {{ quota }} / {{ member.quota }}
                <template v-if="quota > 0 && timeoutBlocks < currentBlock - keepaliveBlock">
                  <span class="snooze">Z</span>
                </template>
              </td>
              <td style="text-align: center;">{{ member.balance }} ETH</td>
            </template>
            <template v-else>
              <td style="text-align: center;">{{ member.i }}</td>
              <td><small>{{ member.address }}</small></td>
              <td style="text-align: center;">{{ member.quota }}</td>
              <td style="text-align: center;">{{ member.balance }} ETH</td>
            </template>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style>
.activeMember {
  font-weight: bold;
}
.snooze {
  position: relative;
  font-size: 14px;
  user-select: none;
  font-family: sans-serif;
  width: 24px;
  height: 16px;
  padding-top: 9px;
  padding-left: 1px;
}
.snooze::before {
  content: "Z";
  position: absolute;
  font-size: 10px;
  left: 11px;
  top: 3px;
}
.snooze::after {
  content: "Z";
  position: absolute;
  font-size: 7px;
  left: 19px;
  top: -1px;
  font-weight: bold;
}
</style>
<script>
import Promise from 'bluebird';
import sortBy from 'lodash/sortBy';
import getRobonomics from '../utils/robonomics';
import bus from '../utils/bus';
import { formatDecimals } from '../utils/utils';

let robonomics;

export default {
  name: 'Step21',
  props: ['lighthouse'],
  data() {
    return {
      showWorkers: false,
      lighthouseBalance: 0,
      members: [],
      marker: 0,
      quota: 0,
      keepaliveBlock: 0,
      currentBlock: 0,
      timeoutBlocks: 0,
      lastUpd: 0,
    };
  },
  created() {
    robonomics = getRobonomics();
    this.fetchData();
    this.watchBlock();
  },
  methods: {
    fetchData() {
      robonomics.ready().then(() => {
        robonomics.xrt.call('balanceOf', [this.lighthouse])
          .then((r) => {
            this.lighthouseBalance = `${formatDecimals(r, 9)} XRT`;
          });
        robonomics.lighthouse.call('quota')
          .then((quota) => {
            this.quota = Number(quota);
          });
        robonomics.lighthouse.call('marker')
          .then((marker) => {
            this.marker = Number(marker);
          });
        robonomics.lighthouse.call('keepaliveBlock')
          .then((keepaliveBlock) => {
            this.keepaliveBlock = Number(keepaliveBlock);
          });
        robonomics.lighthouse.call('timeoutBlocks')
          .then((timeoutBlocks) => {
            this.timeoutBlocks = Number(timeoutBlocks);
          });
        robonomics.lighthouse.getMembers()
          .then((result) => {
            const members = [];
            const quotas = [];
            const balances = [];
            result.forEach((member, i) => {
              members.push({
                i,
                address: member,
                quota: 0,
                balance: 0,
              });
              quotas.push(robonomics.lighthouse.call('quotaOf', [member]));
              balances.push(Promise.promisify(web3.eth.getBalance)(member));
            });
            Promise.all(quotas)
              .then((res) => {
                res.forEach((quota, i) => {
                  members[i].quota = Number(quota);
                });
                return Promise.all(balances);
              })
              .then((res) => {
                res.forEach((balance, i) => {
                  members[i].balance = Number(web3.fromWei(balance)).toFixed(3);
                });
                this.members = sortBy(members, 'i');
              });
          });
      });
    },
    watchBlock() {
      robonomics.ready().then(() => {
        const setCurrentBlock = () => {
          robonomics.web3.eth.getBlockNumber((e, r) => {
            this.currentBlock = r;
            setTimeout(setCurrentBlock, 10000);
          });
        };
        setCurrentBlock();
        const updData = () => {
          if ((this.currentBlock - this.lastUpd) >= 1) {
            this.fetchData();
            this.lastUpd = this.currentBlock;
          }
          setTimeout(updData, 10000);
        };
        updData();
      });
    },
  },
  mounted() {
    bus.$on('updStep21', () => {
      this.fetchData();
    });
  },
};
</script>
