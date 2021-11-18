<template>
  <RCard class="window" id="window-lighthouse-providers">
    <div class="window-head">
      <span>{{ $t("lighthouse.providers.title") }}</span>
      <a class="window-head-toggle" href="#">–</a>
    </div>
    <div class="window-content">
      <table class="container-full table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t("lighthouse.providers.address") }}</th>
            <th>{{ $t("lighthouse.providers.quota") }}</th>
            <th>{{ $t("lighthouse.providers.balance") }}</th>
            <th>{{ $t("lighthouse.providers.status") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="member in membersSorted"
            :key="member.i"
            :class="{ disabled: member.i != marker }"
          >
            <td>
              <span
                v-if="member.i == marker"
                style="font-weight: bold; color: #03a5ed"
                >&gt;</span
              >
              {{ member.i }}
            </td>
            <td>
              <RChainExplorer :address="member.address" />
            </td>
            <td>
              <template v-if="member.i == marker"
                >{{ quota }} / {{ member.quota }}</template
              >
              <template v-else
                >{{ member.quota }} / {{ member.quota }}</template
              >
            </td>
            <td>{{ member.balance }} ETH</td>
            <td>
              <template v-if="member.last">
                <span>
                  {{
                    $t("lighthouse.providers.last", {
                      blocks: currentBlock - member.last
                    })
                  }}
                  <RChainExplorer
                    category="tx"
                    :address="member.lastTx"
                    :isAvatar="false"
                  />
                </span>
              </template>
              <template v-else-if="minBlock > 0">
                <span>{{
                  $t("lighthouse.providers.more", {
                    blocks: currentBlock - minBlock
                  })
                }}</span>
              </template>
              <template v-else>
                <span>{{
                  $t("lighthouse.providers.more", { blocks: timeoutInBlocks })
                }}</span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </RCard>
</template>

<script>
import _sortBy from "lodash/sortBy";

export default {
  props: ["lighthouse"],
  data() {
    return {
      members: [],
      quota: 0,
      marker: 0,
      timeoutInBlocks: 0,
      currentBlock: 0,
      minBlock: 0,
      listenerBlock: null
    };
  },
  computed: {
    membersSorted: function () {
      return _sortBy(this.members, "i");
    }
  },
  async created() {
    this.watchBlock();
    this.fetchData();
  },
  destroyed() {
    if (this.listenerBlock) {
      this.listenerBlock.unsubscribe();
    }
  },
  methods: {
    async watchBlock() {
      this.currentBlock = await this.$robonomics.web3.eth.getBlockNumber();
      this.listenerBlock = this.$robonomics.web3.eth.subscribe(
        "newBlockHeaders",
        function (error, result) {
          if (!error) {
            if (result.number > this.currentBlock) {
              this.currentBlock = result.number;
              this.fetchData();
              if (this.currentBlock - this.lastUpd >= 1) {
                this.lastUpd = this.currentBlock;
              }
            }
          }
        }
      );
    },
    async fetchData() {
      this.quota = Number(
        await this.$robonomics.lighthouse.methods.quota().call()
      );
      this.marker = Number(
        await this.$robonomics.lighthouse.methods.marker().call()
      );
      this.timeoutInBlocks = Number(
        await this.$robonomics.lighthouse.methods.timeoutInBlocks().call()
      );
      this.getProviders();
    },
    getProviders() {
      this.$robonomics.lighthouse.getProviders().then((result) => {
        const members = [];
        const quotas = [];
        const balances = [];
        result.forEach((member, i) => {
          members.push({
            i: i + 1,
            address: member,
            quota: 0,
            balance: 0,
            last: null,
            lastTx: null
          });
          quotas.push(
            this.$robonomics.lighthouse.methods.quotaOf(member).call()
          );
          balances.push(this.$robonomics.web3.eth.getBalance(member));
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
              members[i].balance = Number(
                this.$robonomics.web3.utils.fromWei(balance)
              ).toFixed(3);
            });
            members.forEach((item, i) => {
              const index = this.members.findIndex((member) => {
                return member.address === item.address;
              });
              if (index >= 0) {
                members[i].last = this.members[index].last;
                members[i].lastTx = this.members[index].lastTx;
              }
            });

            this.members = members;
            this.providerLastBlock();
          });
      });
    },
    async providerLastBlock() {
      const lastBlock = await this.$robonomics.web3.eth.getBlockNumber();

      const fromBlock =
        this.lastUpdFind > 0
          ? this.lastUpdFind
          : this.keepAliveBlock > 0
          ? this.keepAliveBlock - this.timeoutInBlocks
          : lastBlock - 100;

      if (fromBlock === lastBlock) {
        // skip
        return;
      }

      const events = (
        await this.$robonomics.factory.getPastEvents("NewLiability", {
          fromBlock: fromBlock,
          toBlock: lastBlock
        })
      ).reverse();

      const newMembers = {};
      for (let item of events) {
        const t = await this.$robonomics.web3.eth.getTransaction(
          item.transactionHash
        );
        if (t.to === this.$robonomics.lighthouse.address) {
          const index = this.members.findIndex((member) => {
            return member.address === t.from;
          });
          if (index >= 0) {
            newMembers[index] = {
              block: item.blockNumber,
              tx: item.transactionHash
            };
            break;
          }
        }
      }
      Object.keys(newMembers).forEach((index) => {
        this.$set(this.members[index], "last", newMembers[index].block);
        this.$set(this.members[index], "lastTx", newMembers[index].tx);
        // this.members[index].last = newMembers[index].block;
        // this.members[index].lastTx = newMembers[index].tx;
      });
      if (this.minBlock === 0) {
        this.minBlock = fromBlock;
      }
      this.lastBlock = lastBlock;
    }
  }
};
</script>
