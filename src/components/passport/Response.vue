<template>
  <div class="t-align--center">
    <div>{{ $t("passport.priceTitle") }}:</div>
    <b class="t-gt">{{ cost | fromWei(decimals, symbol) }}</b>
    <p>
      <a
        href="#"
        onclick="show(this, '#info', 'Minimize details', 'Show more details');return false;"
      >{{ $t("passport.details") }}</a>
    </p>
    <div id="info" style="display:none;text-align: left;">
      <div class="row">
        <div class="col-sm-12">
          <div class="m-b-5">
            <span>{{ $t("passport.agent") }}:</span>&nbsp;
            <RLinkExplorer :text="sender" />
          </div>
          <div class="m-b-5">
            <span>{{ $t("passport.token") }}:</span>&nbsp;
            <RLinkExplorer :text="address" category="token" />
          </div>
          <div class="m-b-5">
            <span>{{ $t("passport.objective") }}:</span>&nbsp;
            <RLinkExplorer :text="objective" type="ipfs" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import token from "./token";

export default {
  props: ["sender", "objective", "address", "cost"],
  mixins: [token]
};
</script>
