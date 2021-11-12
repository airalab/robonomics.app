<template>
  <Page>
    <section v-if="ready" class="section-light section-centered">
      <h2>{{ $t("passport.title") }}</h2>
      <template v-if="passport">
        <Passport :address="passport" />
      </template>
      <template v-else-if="$robonomics.account">
        <Form ref="form" @onSubmit="handleSubmit" />
        <Request
          v-if="!roboCycle.offer"
          ref="request"
          :model="model"
          :token="tokenAddress"
          :validator="validator"
          @submit="$refs.form.submit()"
          @on-response="handleResponse"
        />
        <template v-else>
          <section>
            <div class="form-section-title">{{ $t("passport.subtitle3") }}</div>
            <Response
              :sender="roboCycle.offer.sender"
              :objective="roboCycle.offer.objective"
              :address="roboCycle.offer.token"
              :from="$robonomics.account.address"
              :to="$robonomics.factory.address"
              :cost="roboCycle.offer.cost"
              :initDetails="Number(cost) > Number(myAllowance)"
            />
            <section
              v-if="
                roboCycle.demand === null &&
                Number(cost) > 0 &&
                Number(myAllowance) < Number(roboCycle.offer.cost)
              "
              class="section-light"
            >
              <div>
                <b>{{ $t("passport.reqApprove") }}</b>
              </div>
              <Approve
                :address="roboCycle.offer.token"
                :from="$robonomics.account.address"
                :to="$robonomics.factory.address"
                :initAmountWei="cost"
              />
            </section>

            <Steps
              v-if="roboCycle.demand"
              :status="roboCycle.status"
              :liability="roboCycle.liability"
            />
            <section
              v-if="
                roboCycle.demand === null || roboCycle.status != statuses.RESULT
              "
              :class="{
                disabled:
                  (Number(cost) > 0 && Number(myAllowance) < Number(cost)) ||
                  (roboCycle.demand && roboCycle.status != statuses.EMPTY)
              }"
            >
              <RButton
                @click="sendMsgDemand"
                fullWidth
                size="big"
                :disabled="
                  roboCycle.status > statuses.EMPTY &&
                  roboCycle.status < statuses.RESULT
                "
              >
                <div
                  class="loader-ring"
                  v-if="
                    roboCycle.status > statuses.EMPTY &&
                    roboCycle.status < statuses.RESULT
                  "
                ></div>
                &nbsp;{{ $t("passport.order") }}
              </RButton>
            </section>

            <div v-if="roboCycle.demand && roboCycle.status == statuses.RESULT">
              <router-link
                class="container-full btn-big btn-green"
                :to="{
                  name: 'passport-view',
                  params: { passport: roboCycle.liability }
                }"
                >{{ $t("passport.link") }}</router-link
              >
            </div>
          </section>
        </template>
      </template>
    </section>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import Approve from "@/components/approve/Form";
import Steps from "./Steps";
import Form from "./Form";
import Request from "./Request";
import Response from "./Response";
import Passport from "./Passport";
import { number } from "@/utils/tools";
import token from "@/mixins/token";
import order, { STATUS } from "@/mixins/order";
import config from "~config";

export default {
  mixins: [token, order],
  props: ["passport"],
  data() {
    return {
      statuses: STATUS,
      roboCycle: {
        status: 0,
        demand: null,
        offer: null,
        liability: null,
        result: null
      },
      tokenAddress: "0x0000000000000000000000000000000000000000",
      validator: "0x0000000000000000000000000000000000000000",
      model: "QmWDRjU7xrM7pFUDuAVbV6kytuFgooahNLsqvCnipPgSSQ",
      ready: false
    };
  },
  components: {
    Page,
    Form,
    Request,
    Response,
    Approve,
    Steps,
    Passport
  },
  computed: {
    cost() {
      return number.numToString(this.roboCycle.offer.cost);
    },
    myAllowance: function () {
      if (this.$robonomics.account && this.roboCycle.offer) {
        return this.allowance(
          this.roboCycle.offer.token,
          this.$robonomics.account.address,
          this.$robonomics.factory.address
        );
      }
      return 0;
    }
  },
  created() {
    this.tokenAddress = config.chain.get().TOKEN.dai.address;
    if (this.$robonomics.messenger) {
      this.$robonomics.messenger.stop();
    }
    this.$robonomics
      .initLighthouse(config.chain.get().DEFAULT_LIGHTHOUSE)
      .then(() => {
        this.ready = true;
        this.$robonomics.onDemand(this.model, (msg) => {
          console.log(msg);
        });
      });
    this.$on("update", this.handleOrder);
  },
  methods: {
    handleSubmit({ error, fields }) {
      this.$refs.request.requestPrice(error, fields);
    },
    handleResponse(msg) {
      this.roboCycle = {
        ...this.roboCycle,
        status: 0,
        offer: msg.toObject()
      };
      if (this.$robonomics.account) {
        this.watchToken(
          this.roboCycle.offer.token,
          this.$robonomics.account.address,
          this.$robonomics.factory.address
        );
      }
    },
    sendMsgDemand() {
      const demand = {
        model: this.roboCycle.offer.model,
        objective: this.roboCycle.offer.objective,
        token: this.roboCycle.offer.token,
        cost: this.roboCycle.offer.cost,
        lighthouse: this.roboCycle.offer.lighthouse,
        validator: this.roboCycle.offer.validator,
        validatorFee: 0,
        deadline: this.roboCycle.offer.deadline
      };

      this.runOrder({ demand, offer: this.roboCycle.offer });
    },
    handleOrder(order) {
      this.roboCycle = order;
    }
  }
};
</script>
