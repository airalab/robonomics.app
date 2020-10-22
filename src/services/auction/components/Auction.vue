<template>
  <fragment>
    <Progress
      :percent="percent"
      :amount="totalReceived.toString()"
      :max="ceiling.toString()"
    />

    <div class="row" style="margin-top: 30px;">
      <div class="col-md-6" style="text-align: center; font-size: 20px;">
        Sent earlier
      </div>
      <div class="col-md-6" style="text-align: center; font-size: 20px;">
        <span
          class="js-tooltip"
          data-tooltip="real amount of XRT will become known only at last transaction moment"
        >
          Estimation amount of XRT
        </span>
      </div>
    </div>
    <div class="row">
      <div
        class="col-md-6"
        style="text-align: center; font-size: 20px; font-weight: bold;"
      >
        {{ myBid | fromWei(18, "ETH", 4) }}
      </div>
      <div
        class="col-md-6"
        style="text-align: center; font-size: 20px; font-weight: bold;"
      >
        {{ myTokens | fromWei(9, "XRT", 4) }}
      </div>
    </div>

    <blockquote style="margin: 20px 0;">
      Current XRT / ETH auction rate is 1 ETH =
      {{ price | fromWei(9, "XRT", 4) }}
    </blockquote>

    <template v-if="stage === Stages.AuctionStarted">
      <div v-if="Number(calcTokenPrice) <= Number(calcStopPrice)">
        The price for the token has dropped too much, the auction is over.
      </div>
      <Activate v-else @upBurn="getData" />
      <!-- maxWei {{ maxWei | fromWei(18, "ETH") }} -->
    </template>
    <!-- <template v-else-if="stage === Stages.AuctionDeployed">
      AuctionDeployed
    </template>
    <template v-else-if="stage === Stages.AuctionSetUp">
      AuctionSetUp
    </template> -->
    <template v-else-if="stage === Stages.AuctionEnded">
      Auction is over. Waiting for finalization.
    </template>
    <template v-else-if="stage === Stages.TradingStarted">
      <div v-if="Number(myTokens) > 0">
        <Claim @exodus="handleExodus" />
      </div>
    </template>
    <template v-if="exodus.account">
      <h3>Exodus</h3>
      <p>Exodus made for account {{ exodus.account }}</p>
      <p>
        details tx:
        <a :href="exodus.tx | urlChainExplorer('tx')" target="_blank">{{
          exodus.tx | labelAddress
        }}</a>
      </p>
    </template>
  </fragment>
</template>

<script>
import token from "@/mixins/token";
import utils from "web3-utils";
import config from "../config";
import Activate from "./Activate";
import Claim from "./Claim";
import Progress from "./Progress";
import AuctionAbi from "../abi/Auction.json";

export default {
  mixins: [token],
  components: {
    Activate,
    Claim,
    Progress
  },
  // data() {
  //   return {
  //     maxTokenSold: 0,
  //     ceiling: "1000000000000000000000",
  //     totalReceived: "75578000000000000000",
  //     calcTokenPrice: 1,
  //     calcStopPrice: 0,
  //     calcCurrentTokenPrice: 0,
  //     stage: "2",
  //     maxWei: 0,
  //     myBid: "3500000000000000000",
  //     myTokens: "35568000000",
  //     Stages: {
  //       AuctionDeployed: "0",
  //       AuctionSetUp: "1",
  //       AuctionStarted: "2",
  //       AuctionEnded: "3",
  //       TradingStarted: "4"
  //     }
  //   };
  // },
  data() {
    return {
      maxTokenSold: 0,
      ceiling: 0,
      totalReceived: 0,
      calcTokenPrice: 0,
      calcStopPrice: 0,
      calcCurrentTokenPrice: 0,
      stage: 0,
      maxWei: 0,
      myBid: 0,
      myTokens: 0,
      exodus: {
        account: null,
        tx: null
        // account: "dasdasdasdasdasd",
        // tx: "0x73748471c3cdeabf09601a373d8fc68ed56f2997debeaaea3bc4c5d9c860f42d"
      },
      Stages: {
        AuctionDeployed: "0",
        AuctionSetUp: "1",
        AuctionStarted: "2",
        AuctionEnded: "3",
        TradingStarted: "4"
      }
    };
  },
  created() {
    // this.watchToken(config.XRT, this.$robonomics.account.address);
    // this.getData();

    const watch = (blockNumber, cb) => {
      this.$robonomics.web3.eth.getBlockNumber(function (_, current) {
        if (current <= blockNumber) {
          setTimeout(function () {
            watch(blockNumber, cb);
          }, 1000);
        } else {
          cb();
          setTimeout(function () {
            watch(current, cb);
          }, 1000);
        }
      });
    };
    watch(null, async () => {
      await this.getData();
    });
  },
  mounted() {
    this.tooltip();
  },
  computed: {
    percent: function () {
      return this.ceiling > 0
        ? Math.round(
            new utils.BN(this.totalReceived)
              .mul(new utils.BN("100"))
              .div(new utils.BN(this.ceiling))
              .toNumber()
          )
        : 0;
    },
    price: function () {
      return this.calcCurrentTokenPrice
        ? new utils.BN("1000000000000000000")
            .mul(new utils.BN("1000000000"))
            .div(new utils.BN(this.calcCurrentTokenPrice))
            .toString()
        : "0";
    }
  },
  methods: {
    log(...args) {
      const isShow = false;
      if (isShow) {
        console.log(...args);
      }
    },
    tooltip() {
      const reference = document.querySelectorAll(".js-tooltip");
      if (reference) {
        reference.forEach(function (elem) {
          new Tooltip(elem, {
            title: elem.getAttribute("data-tooltip"),
            placement: elem.getAttribute("data-placement") || "auto",
            container: "body"
          });
        });
      }
    },
    async handleExodus({ account, tx }) {
      this.exodus = {
        account,
        tx
      };
    },
    async getData() {
      const contract = new this.$robonomics.web3.eth.Contract(
        AuctionAbi,
        config.AUCTION
      );
      // const token = await contract.methods.token().call();
      // this.log("token", token);
      const WAITING_PERIOD = await contract.methods.WAITING_PERIOD().call();
      this.log("WAITING_PERIOD", WAITING_PERIOD);
      this.maxTokenSold = await contract.methods.maxTokenSold().call();
      this.log("maxTokenSold", this.maxTokenSold, "столько токенов раздаем");
      this.ceiling = await contract.methods.ceiling().call();
      this.log("ceiling", this.ceiling, "планируется собрать столько эфиров");
      // const priceFactor = await contract.methods.priceFactor().call();
      // this.log("priceFactor", priceFactor);
      // const startBlock = await contract.methods.startBlock().call();
      // this.log("startBlock", startBlock);
      const endTime = await contract.methods.endTime().call();
      this.log("endTime", endTime);
      this.totalReceived = await contract.methods.totalReceived().call();
      this.log(
        "totalReceived",
        this.totalReceived,
        "столько эфиров уже собрано"
      );
      const finalPrice = await contract.methods.finalPrice().call();
      this.log("finalPrice", finalPrice);
      this.calcCurrentTokenPrice = await contract.methods
        .calcCurrentTokenPrice()
        .call();
      // this.log("calcCurrentTokenPrice", calcCurrentTokenPrice);
      this.calcStopPrice = await contract.methods.calcStopPrice().call();
      this.log("calcStopPrice", this.calcStopPrice);
      this.calcTokenPrice = await contract.methods.calcTokenPrice().call();
      this.log("calcTokenPrice", this.calcTokenPrice);
      this.stage = await contract.methods.stage().call();
      this.log("stage", this.stage);
      const Stages = {
        AuctionDeployed: "0",
        AuctionSetUp: "1",
        AuctionStarted: "2",
        AuctionEnded: "3",
        TradingStarted: "4"
      };

      this.myBid = await contract.methods
        .bids(this.$robonomics.account.address)
        .call();
      this.log("столько эфиров я уже вкинул", this.myBid);

      if (this.stage === Stages.AuctionStarted) {
        this.log("аукцион начался");

        // нужно проверить возможно аукцион уже не работает, просто статус не обновлен
        if (Number(this.calcTokenPrice) <= Number(this.calcStopPrice)) {
          this.log(
            "цена за токен слишком упала, аукцион закончился, нужно дернуть updateStage"
          );
        } else {
          let maxWei = new utils.BN(this.maxTokenSold)
            .mul(new utils.BN(this.calcTokenPrice))
            .div(new utils.BN("1000000000"))
            .sub(new utils.BN(this.totalReceived));
          const maxWeiBasedOnTotalReceived = new utils.BN(this.ceiling).sub(
            new utils.BN(this.totalReceived)
          );
          if (maxWeiBasedOnTotalReceived.lt(maxWei)) {
            maxWei = maxWeiBasedOnTotalReceived;
          }
          this.maxWei = maxWei;
          this.log("максимум сколько я могу вкинуть", maxWei.toString());

          // const r = await axios.get(
          //   `http://localhost:3000/api/sign/${this.$robonomics.account.address}`
          // );
          // const signature = r.data.result;
          // this.log("signature", signature);

          this.log("bid");
        }

        this.myTokens = new utils.BN(this.myBid)
          .mul(new utils.BN("1000000000"))
          .div(new utils.BN(this.calcStopPrice)); // пока аукцион еще идет
        this.log("столько токенов я смогу забрать", this.myTokens.toString());
      } else if (this.stage === Stages.TradingStarted) {
        this.log("можно забирать свои токены claimTokens");

        this.myTokens = new utils.BN(this.myBid)
          .mul(new utils.BN("1000000000"))
          .div(new utils.BN(finalPrice)); // если аукцион уже закончился
        this.log("столько токенов я смогу забрать", this.myTokens.toString());
      } else if (this.stage === Stages.AuctionEnded) {
        this.log("аукцион закончен");

        this.myTokens = new utils.BN(this.myBid)
          .mul(new utils.BN("1000000000"))
          .div(new utils.BN(finalPrice)); // если аукцион уже закончился
        this.log("столько токенов я смогу забрать", this.myTokens.toString());

        if (
          Math.ceil(Date.now() / 1000) >
          Number(endTime) + Number(WAITING_PERIOD)
        ) {
          this.log("нужно еще раз обновить updateStage");
        } else {
          this.log("WAITING_PERIOD");
        }
      }
    }
  }
};
</script>
