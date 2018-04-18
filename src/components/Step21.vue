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
          </tr>
          <tr>
            <td>
              <p class="t-break">{{ $route.params.lighthouse }}</p>
            </td>
            <td>{{ lighthouseBalance }}</td>
            <td>{{ lighthouseMembers }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import { Lighthouse } from 'aira-js';
import aira from '../utils/aira';

const formatDecimals = (price, decimals) => {
  const priceNum = new web3.BigNumber(price);
  return priceNum.shift(-decimals).toNumber();
};

export default {
  name: 'Step21',
  data() {
    return {
      lighthouse: 0,
      lighthouseBalance: 0,
      lighthouseMembers: 0,
    };
  },
  created() {
    this.lighthouse = this.$route.params.lighthouse;
    this.fetchData();
  },
  methods: {
    fetchData() {
      aira.xrt.call('balanceOf', [this.lighthouse])
        .then((r) => {
          this.lighthouseBalance = `${formatDecimals(r, 9)} XRT`;
        });

      const lighthouseContract = new Lighthouse(web3, this.lighthouse);
      lighthouseContract.getMembers()
        .then((members) => {
          this.lighthouseMembers = members.length;
        });
    },
  },
};
</script>
