<template>
  <RHeader>
    <template v-slot:logo>
      <a href="/"><img alt="dApp logo" src="assets/i/logo-dapp.svg" /></a
      ><span>Robonomics.Network dApp</span>
    </template>
    <div>
      <div class="account on" v-if="$robonomics.account">
        <div class="account__avatar">
          <RAvatar :address="account" />
        </div>
        <div class="account__info">
          <div class="address">{{ account | labelAddress }}</div>
          <div class="status">connected</div>
        </div>
        <!-- <div class="account__actions">
          <button class="btn-outline" @click="disconnect">
            <span class="i-switch"></span
            ><span class="dynamictext">Disconnect</span>
          </button>
        </div> -->
      </div>

      <button v-if="!$robonomics.account" @click="connect">
        <span class="i-switch"></span><span>Connect account</span>
      </button>
    </div>
  </RHeader>
</template>

<script>
export default {
  data() {
    return {
      account: null
    };
  },
  async created() {
    if (this.$robonomics.account) {
      this.account = this.$robonomics.account.address;
    }
  },
  methods: {
    async connect() {
      this.$store.dispatch("chain/accessAccount", false);
    }
    // async disconnect() {
    //   this.$store.dispatch("chain/disconnect");
    // }
  }
};
</script>
