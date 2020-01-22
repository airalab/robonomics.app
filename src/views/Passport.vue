<template>
  <Page>
    <section v-if="ready" class="section-light section-centered">
      <h2>{{ $t("passport.title") }}</h2>
      <template v-if="passport">
        <Passport :address="passport" />
      </template>
      <template v-else>
        <Form ref="form" :onSubmit="onSubmit" />
        <Request
          v-if="!response"
          ref="request"
          :model="model"
          :token="token"
          :validator="validator"
          :submit="submit"
          :onResponse="onResponse"
        />
        <template v-else>
          <Response
            :sender="response.sender"
            :objective="response.objective"
            :token="response.token"
          />
          <Approve
            v-if="Number(response.cost) > 0"
            :address="response.token"
            :toAddress="$robonomics.factory.address"
            :initAmountWei="cost"
            :alwaysShow="false"
            :onFetch="onAllowance"
          />
          <Order
            v-if="
              Number(allowance) >= response.cost &&
                (!demand || demand.status < statuses.RESULT)
            "
            :offer="response"
            :onDemand="onDemand"
          />
          <Steps v-if="demand" :status="demand.status" :liability="demand.liability" />
          <div v-if="demand && demand.status == statuses.RESULT">
            {{ $t("passport.success") }}
            <h3>{{ demand.liability }}</h3>
            <router-link
              :to="{
                name: 'passport-view',
                params: { passport: demand.liability }
              }"
            >{{ $t("passport.link") }}</router-link>
          </div>
        </template>
      </template>
    </section>
  </Page>
</template>

<script>
import { mapState } from "vuex";
import Page from "@/components/Page";
import Approve from "@/components/approve/Main";
import Steps from "@/components/Steps";
import Form from "@/components/passport/Form";
import Request from "@/components/passport/Request";
import Response from "@/components/passport/Response";
import Order from "@/components/passport/Order";
import Passport from "@/components/passport/Passport";
import { number } from "../RComponents/tools/utils";

export default {
  props: ["passport"],
  data() {
    return {
      response: null,
      allowance: 0,
      demandId: 0,
      token: "0x0000000000000000000000000000000000000000",
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
    Order,
    Steps,
    Passport
  },
  computed: {
    ...mapState("msg", ["statuses"]),
    demand() {
      return this.$store.getters["msg/demandById"](this.demandId);
    },
    cost() {
      return number.numToString(this.response.cost);
    }
  },
  created() {
    this.token = this.$robonomics.xrt.address;
    this.$robonomics
      .initLighthouse("airalab")
      // .initLighthouse("mytest")
      // .initLighthouse("mytest.lighthouse.5.robonomics.eth")
      .then(() => {
        this.ready = true;
        this.$robonomics.onDemand(this.model, msg => {
          console.log(msg);
        });
      });
  },
  methods: {
    submit() {
      this.$refs.form.submit();
    },
    onSubmit(e, fields) {
      this.$refs.request.requestPrice(e, fields);
    },
    onResponse(msg) {
      this.response = msg;
    },
    onAllowance({ allowance }) {
      this.allowance = allowance;
    },
    onDemand(demandId) {
      this.demandId = demandId;
    }
  }
};
</script>
