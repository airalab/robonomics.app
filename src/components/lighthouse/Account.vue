<template>
  <div class="row">
    <div class="col-lg-12">
      <div class="section-bordered m-t-0 m-b-0">
        <p class="t-big t-style_uppercase">Account details</p>
        <div class="row">
          <div class="col-md-4">
            <section class="section-small">
              <p>Your address:</p>
              <p class="code-overflow-line">
                <b>
                  <IconLink
                    v-if="address!=''"
                    :href="`https://etherscan.io/address/${address}`"
                    :text="address"
                    isCopy
                  />
                </b>
              </p>
            </section>
          </div>
          <div class="col-md-4">
            <section class="section-small">
              <span>Your balance:</span>
              <br>
              <b class="t-big t-style_uppercase">{{ balance | fromWei(9, 'XRT') }}</b>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      address: "",
      balance: 0
    };
  },
  mounted() {
    this.address = this.$robonomics.account.address;
    return this.fetchData();
  },
  methods: {
    fetchData() {
      return this.$robonomics.xrt.call
        .balanceOf(this.$robonomics.account.address)
        .then(balanceOf => {
          this.balance = balanceOf;
        });
    }
  }
};
</script>
