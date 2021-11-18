<template>
  <RCard class="window" id="window-developletter">
    <div class="window-head">
      <span>{{ $t("lighthouse.details.title") }}</span>
      <!-- a.window-head-toggle(href="#") –-->
    </div>
    <div class="window-content">
      <p>
        <span class="t-sm">{{ $t("lighthouse.details.contract") }}:</span>
        <br />
        <RChainExplorer :address="lighthouse" />
      </p>
      <hr />
      <p>
        <span class="t-sm">{{ $t("lighthouse.details.status") }}:</span>
        <br />
        <b v-if="isSleeping">{{ $t("lighthouse.details.sleeping") }}</b>
        <b v-else>{{ $t("lighthouse.details.active") }}</b>
      </p>
      <hr />
      <p>
        <span class="t-sm">{{ $t("lighthouse.details.balance") }}:</span>
        <br />
        <b>{{ lighthouseBalance | fromWei(9, "XRT") }}</b>
      </p>
      <hr />
      <p>
        <span class="t-sm">{{ $t("lighthouse.details.stake") }}:</span>
        <br />
        <b>{{ minimalStake | fromWei(9, "XRT") }}</b>
      </p>
      <hr />
      <WorkerForm v-if="$robonomics.account" />
      <hr />
      <WithdrawForm v-if="$robonomics.account" />
    </div>
  </RCard>
</template>

<script>
import WorkerForm from "./WorkerForm";
import WithdrawForm from "./WithdrawForm";

export default {
  props: ["lighthouse"],
  components: {
    WorkerForm,
    WithdrawForm
  },
  data() {
    return {
      showWorkers: false,
      timeoutInBlocks: 0,
      keepAliveBlock: 0,
      currentBlock: 0,
      lighthouseBalance: 0,
      minimalStake: 0,
      listenerBlock: null
    };
  },
  computed: {
    downtime: function () {
      return this.currentBlock - this.keepAliveBlock;
    },
    isSleeping: function () {
      return this.downtime > this.timeoutInBlocks;
    }
  },
  created() {
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
            }
          }
        }
      );
    },
    async fetchData() {
      this.lighthouseBalance = Number(
        await this.$robonomics.xrt.methods
          .balanceOf(this.$robonomics.lighthouse.address)
          .call()
      );
      this.minimalStake = Number(
        await this.$robonomics.lighthouse.methods.minimalStake().call()
      );
      this.keepAliveBlock = Number(
        await this.$robonomics.lighthouse.methods.keepAliveBlock().call()
      );
      this.timeoutInBlocks = Number(
        await this.$robonomics.lighthouse.methods.timeoutInBlocks().call()
      );
    }
  }
};
</script>
