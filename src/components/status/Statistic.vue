<template>
  <section class="row" :class="{ 'section-disabled': !connected }">
    <div class="col-md-4">
      <div class="section-border">
        <div class="t-align--center">
          <h3 class="t-color-violet">{{ $t('robotics_ethereum_control') }}</h3>
          <div class="t-gt">{{li.create.a}}</div>
        </div>
        <div class="expand-statistic-1" style="display:none">
          <table class="container-full table-striped">
            <caption>{{ $t('total_contracts') }}</caption>
            <tbody>
              <tr>
                <td>{{ $t('day') }}</td>
                <td>{{li.create.d}}</td>
              </tr>
              <tr>
                <td>{{ $t('week') }}</td>
                <td>{{li.create.w}}</td>
              </tr>
              <tr>
                <td>{{ $t('month') }}</td>
                <td>{{li.create.m}}</td>
              </tr>
              <tr>
                <td>{{ $t('total') }}</td>
                <td>{{li.create.a}}</td>
              </tr>
            </tbody>
          </table>
          <table class="container-full table-striped">
            <caption>{{ $t('fin_contarcts') }}</caption>
            <tbody>
              <tr>
                <td>{{ $t('day') }}</td>
                <td>{{li.fin.d}}</td>
              </tr>
              <tr>
                <td>{{ $t('week') }}</td>
                <td>{{li.fin.w}}</td>
              </tr>
              <tr>
                <td>{{ $t('month') }}</td>
                <td>{{li.fin.m}}</td>
              </tr>
              <tr>
                <td>{{ $t('total') }}</td>
                <td>{{li.fin.a}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <a
        class="btn-violet container-full btn-simple"
        href="#"
        :onclick="`show(this, '.expand-statistic-1', '&amp;uarr; ${$t('minimize')} &amp;uarr;', '&amp;darr; ${$t('expand')} &amp;darr;');return false;`"
      >&darr; {{ $t('expand') }} &darr;</a>
    </div>
    <div class="col-md-4">
      <div class="section-border">
        <div class="t-align--center">
          <h3 class="t-color-violet">{{ $t('amount_gas') }}</h3>
          <div class="t-gt">{{gas.full.a}}</div>
        </div>
        <div class="expand-statistic-2" style="display:none">
          <table class="container-full table-striped">
            <caption>{{ $t('total_gas') }}</caption>
            <tbody>
              <tr>
                <td>{{ $t('day') }}</td>
                <td>{{gas.full.d}}</td>
              </tr>
              <tr>
                <td>{{ $t('week') }}</td>
                <td>{{gas.full.w}}</td>
              </tr>
              <tr>
                <td>{{ $t('month') }}</td>
                <td>{{gas.full.m}}</td>
              </tr>
              <tr>
                <td>{{ $t('total') }}</td>
                <td>{{gas.full.a}}</td>
              </tr>
            </tbody>
          </table>
          <table class="container-full table-striped">
            <caption>{{ $t('fin_gas') }}</caption>
            <tbody>
              <tr>
                <td>{{ $t('day') }}</td>
                <td>{{gas.fin.d}}</td>
              </tr>
              <tr>
                <td>{{ $t('week') }}</td>
                <td>{{gas.fin.w}}</td>
              </tr>
              <tr>
                <td>{{ $t('month') }}</td>
                <td>{{gas.fin.m}}</td>
              </tr>
              <tr>
                <td>{{ $t('total') }}</td>
                <td>{{gas.fin.a}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <a
        class="btn-violet container-full btn-simple"
        href="#"
        :onclick="`show(this, '.expand-statistic-2', '&amp;uarr; ${$t('minimize')} &amp;uarr;', '&amp;darr; ${$t('expand')} &amp;darr;');return false;`"
      >&darr; {{ $t('expand') }} &darr;</a>
    </div>
    <div class="col-md-4">
      <div class="section-border">
        <div class="t-align--center">
          <h3 class="t-color-violet">{{ $t('robo_token') }}, XRT</h3>
          <div class="t-gt">{{wn}}</div>
        </div>
        <div class="expand-statistic-3" style="display:none">
          <section>
            <b>{{ $t('token_addr') }}:</b>
            <br>
            <IconLink :href="`https://etherscan.io/token/${xrt.address}`" :text="xrt.address"/>
          </section>

          <table class="container-full table-striped">
            <caption>{{ $t('token_stat') }}</caption>
            <tbody>
              <tr>
                <td>{{ $t('token_total') }}:</td>
                <td>{{totalSupply}} XRT</td>
              </tr>
              <tr>
                <td>{{ $t('reward_tx') }}</td>
                <td>{{wn}} XRT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <a
        class="btn-violet container-full btn-simple"
        href="#"
        :onclick="`show(this, '.expand-statistic-3', '&amp;uarr; ${$t('minimize')} &amp;uarr;', '&amp;darr; ${$t('expand')} &amp;darr;');return false;`"
      >&darr; {{ $t('expand') }} &darr;</a>
    </div>
  </section>
</template>

<script>
import { mapState } from "vuex";
import config from "../../config";

export default {
  data() {
    return {
      xrt: config.XRT
    };
  },
  computed: mapState("statistics", [
    "connected",
    "totalSupply",
    "wn",
    "gas",
    "li"
  ])
};
</script>
