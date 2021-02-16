<template>
  <fragment>
    <div class="row">
      <div class="col-md-6" style="text-align: center">
        <Balance
          :amount="stake.amount"
          symbol="RWS"
          style="font-size: 20px; font-weight: bold"
        />
        &nbsp;
        <span>{{ status }}</span>
        &nbsp;
        <!-- <span
          v-if="stake.status == 2 && current_block - stake.last_update <= lock_duration"
        >{{Number(lock_duration)-(Number(current_block)-Number(stake.last_update))}} blocks</span>-->
        <br />
        <RButton
          size="sm"
          @click="toggleFormActivate = false"
          :disabled="
            !toggleFormActivate ||
            stake.status == 0 ||
            stake.amount <= 0 ||
            (stake.status == 2 &&
              current_block - stake.last_update <= lock_duration)
          "
        >
          withdraw
        </RButton>
      </div>
      <div class="col-md-6" style="text-align: center">
        <Balance
          :amount="myBalance"
          symbol="RWS"
          style="font-size: 20px; font-weight: bold"
        />
        <br />
        <p>
          available for
          <a
            href="https://app.uniswap.org/#/swap?inputCurrency=0x7de91b204c1c737bcee6f000aaa6569cf7061cb7&outputCurrency=0x08ad83d779bdf2bbe1ad9cc0f78aa0d24ab97802"
            target="_blank"
            >trade</a
          >
          or
          <RButton
            size="sm"
            @click="toggleFormActivate = true"
            :disabled="toggleFormActivate || myBalance <= 0"
            >activate</RButton
          >
        </p>
      </div>
    </div>

    <Activate v-if="toggleFormActivate" :account="stake.account" />
    <!-- <Activate
      v-if="toggleFormActivate"
      :account="stake.account"
      @account="handleAccount"
    /> -->
    <Deactivate
      v-else-if="stake.amount > 0"
      :stake="stake"
      :current_block="current_block"
      :lock_duration="lock_duration"
    />

    <div v-if="stake.account && stake.amount > 0">
      <Datalog ref="datalog" :account="stake.account" :amount="stake.amount" />
    </div>
  </fragment>
</template>

<script>
import token from "@/mixins/token";
import { encodeAddress } from "@polkadot/util-crypto";
import config from "../config";
import SubscriptionAbi from "../abi/Subscription.json";
import Activate from "./Activate";
import Deactivate from "./Deactivate";
import Datalog from "./Datalog";
import Balance from "./Balance";
import { getApi } from "../../../utils/substrate";

export default {
  mixins: [token],
  components: {
    Activate,
    Deactivate,
    Datalog,
    Balance
  },
  data() {
    return {
      toggleFormActivate: true,
      current_block: 0,
      lock_duration: 0,
      // account: "",
      stake: {
        last_update: "",
        status: 0,
        amount: "",
        account: ""
      }
    };
  },
  created() {
    this.watchToken(
      config.RWS,
      this.$robonomics.account.address,
      config.SUBSCRIPTION
    );
    this.$robonomics.web3.eth.getBlockNumber((e, r) => {
      this.watchEvents(r);
    });
    setInterval(() => {
      this.$robonomics.web3.eth.getBlockNumber((e, r) => {
        if (this.current_block !== r) {
          this.current_block = r;
        }
      });
    }, 1000);
  },
  mounted() {
    this.upLockDuration();
    this.upStake();
  },
  computed: {
    status: function () {
      return this.stake.status == 1
        ? "Active"
        : this.stake.status == 2
        ? "Locked"
        : "None";
    },
    myBalance: function () {
      return this.balance(config.RWS, this.$robonomics.account.address);
    },
    myBalanceFormat: function () {
      return this.myBalance;
      // return this.balanceFormat(config.RWS, this.$robonomics.account.address);
    }
  },
  methods: {
    // handleAccount(account) {
    //   this.account = account;
    // },
    watchEvents(fromBlock) {
      const contract = new this.$robonomics.web3.eth.Contract(
        SubscriptionAbi,
        config.SUBSCRIPTION
      );
      setInterval(() => {
        this.upStake();
      }, 3000);
      contract.events.Activated({ fromBlock, filter: {} }).on("data", () => {
        this.upStake();
      });
      contract.events.Deactivated({ fromBlock, filter: {} }).on("data", () => {
        this.upStake();
      });
      contract.events.Withdraw({ fromBlock, filter: {} }).on("data", () => {
        this.upStake();
      });
    },
    upLockDuration() {
      const contract = new this.$robonomics.web3.eth.Contract(
        SubscriptionAbi,
        config.SUBSCRIPTION
      );
      return contract.methods
        .lock_duration()
        .call()
        .then((r) => {
          this.lock_duration = r;
        });
    },
    upStake() {
      const contract = new this.$robonomics.web3.eth.Contract(
        SubscriptionAbi,
        config.SUBSCRIPTION
      );
      return contract.methods
        .stakeOf(this.$robonomics.account.address)
        .call()
        .then((r) => {
          if (r.status > 0) {
            this.stake = {
              last_update: r.last_update,
              status: r.status,
              amount: r.amount,
              account: encodeAddress(
                r.account,
                getApi("robonomics").registry.chainSS58
              )
            };
            // this.account = this.stake.account;
          } else {
            this.stake = {
              last_update: "",
              status: 0,
              amount: "",
              account: ""
            };
          }
        });
    }
  }
};
</script>
