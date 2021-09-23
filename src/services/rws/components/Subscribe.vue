<template>
  <fragment>
    <div class="row">
      <div class="col-md-6" style="text-align: center">
        <h3>Subscribe</h3>
        <RButton
          size="sm"
          @click="action = 2"
          :disabled="action === 2 || stake.status == 0 || stake.amount <= 0"
        >
          Withdraw
        </RButton>
        <br />
        <br />
        <Balance
          :amount="stake.amount"
          symbol="RWS"
          style="font-size: 20px; font-weight: bold"
        />
        <br />
        <template v-if="Number(stake.amount) > 0">
          <b>{{ status }}</b> for account
          <b
            style="cursor: copy"
            :title="stake.account"
            v-clipboard:copy="stake.account"
            v-clipboard:success="clipboardSuccessHandler"
          >
            {{ stake.account | labelAddress }}
          </b>
          <br />
          <b>Bandwidth Robonomics</b>:
          <span :class="[Number(bandwidth) > 0 ? 'green' : 'red']">
            {{ bandwidth }}%
          </span>
          <br />
          <router-link
            v-if="Number(bandwidth) > 0"
            :to="{ name: 'rws-accounts', params: { account: stake.account } }"
          >
            Accounts manager
          </router-link>
        </template>
        <template v-else>
          {{ status }}
        </template>
      </div>
      <div class="col-md-6" style="text-align: center">
        <h3>Balance</h3>
        <RButton
          size="sm"
          @click="action = 1"
          :disabled="action === 1 || myBalance <= 0"
          >Activate</RButton
        >
        <br />
        <br />
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
          >
            trade
          </a>
          or activate
        </p>
      </div>
    </div>

    <hr v-if="action > 0" style="margin: 30px 0" />

    <Activate v-if="action === 1" :account="stake.account" />
    <Deactivate
      v-else-if="action === 2 && stake.amount > 0"
      :stake="stake"
      :current_block="current_block"
      :lock_duration="lock_duration"
    />
  </fragment>
</template>

<script>
import token from "@/mixins/token";
import { encodeAddress } from "@polkadot/util-crypto";
import config from "../config";
import SubscriptionAbi from "../abi/Subscription.json";
import Activate from "./Activate";
import Deactivate from "./Deactivate";
import Balance from "./Balance";
import BN from "bignumber.js";
import { Robonomics } from "@/utils/robonomics-substrate";

export default {
  props: ["account"],
  mixins: [token],
  components: {
    Activate,
    Deactivate,
    Balance
  },
  data() {
    return {
      action: 0,
      current_block: 0,
      lock_duration: 0,
      stake: {
        last_update: "",
        status: 0,
        amount: "",
        account: ""
      },
      bandwidthListener: null,
      bandwidth: "0",
      robonomics: null
    };
  },
  created() {
    if (this.account) {
      this.action = 1;
    }
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
    this.robonomics = Robonomics.getInstance(config.CHAIN);
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
      return this.balanceFormat(config.RWS, this.$robonomics.account.address);
    }
  },
  watch: {
    "stake.amount": {
      immediate: true,
      handler: function (newValue, oldValue) {
        if (!oldValue && newValue) {
          this.bandwidthListener = setInterval(async () => {
            if (this.stake.account) {
              const bandwidth = await this.robonomics.rws.getBandwidth(
                this.stake.account
              );
              if (bandwidth.toHuman()) {
                this.bandwidth = new BN(bandwidth)
                  .multipliedBy(new BN("100"))
                  .div(new BN("1000000000"))
                  .toString(10);
              }
            }
          }, 2000);
        } else if (!newValue && oldValue) {
          clearInterval(this.bandwidthListener);
          this.bandwidth = "0";
        }
      }
    }
  },
  destroyed() {
    clearInterval(this.bandwidthListener);
  },
  methods: {
    clipboardSuccessHandler() {
      this.$notify({
        title: "Address copied."
      });
    },
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
                this.robonomics.api.registry.chainSS58
              )
            };
          } else {
            this.stake = {
              last_update: "",
              status: 0,
              amount: "",
              account: this.account ? this.account : ""
            };
          }
        });
    }
  }
};
</script>
