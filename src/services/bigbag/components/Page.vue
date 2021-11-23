<template>
  <Page>
    <RCard class="section-centered">
      <h2>Big Bag sales by Robonomics Developers DAO</h2>
      <div class="item-avatar" style="margin-bottom: 20px">
        <span
          class="item-avatar--image"
          :style="{ 'background-image': `url(${require('../banner.jpg')})` }"
        ></span>
      </div>

      <div v-if="$robonomics.account">
        <ContractForm
          ref="form"
          @onChange="onChange"
          @onSubmit="handleSubmit"
        />
        <br />
        <BigBag v-if="address" :address="address" />
      </div>
      <RButton v-else @click="$web3.initAccount()">
        Connect ethereum account
      </RButton>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import ContractForm from "./ContractForm";
import BigBag from "./BigBag";

export default {
  components: {
    Page,
    ContractForm,
    BigBag
  },
  data() {
    return {
      address: ""
    };
  },
  methods: {
    onChange() {
      this.$refs.form.submit();
    },
    handleSubmit({ error, fields }) {
      if (!error) {
        this.address = fields.address.value;
      } else {
        this.address = "";
      }
    }
  }
};
</script>
