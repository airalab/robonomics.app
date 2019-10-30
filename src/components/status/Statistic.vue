<template>
  <RCard>
    <div class="row">
      <div class="col-md-4">
        <h3 class="m-b-0">{{ $t('robotics_ethereum_control') }}</h3>
        <b class="t-gt">{{li.create.a}}</b>
      </div>
      <div class="col-md-4">
        <h3 class="m-b-0">{{ $t('amount_gas') }}</h3>
        <b class="t-gt">{{gas.full.a}}</b>
      </div>
      <div class="col-md-4">
        <h3 class="m-b-0">{{ $t('robo_token') }}, XRT</h3>
        <b class="t-gt">{{wn}}</b>
      </div>
    </div>
    <hr />
    <div id="statistic" style="display:none">
      <div class="row">
        <div class="col-md-4">
          <table class="container-full table-hover table-full">
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
          <table class="container-full table-hover table-full">
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
        <div class="col-md-4">
          <table class="container-full table-hover table-full">
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
          <table class="container-full table-hover table-full">
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
        <div class="col-md-4">
          <section>
            <b>{{ $t('token_addr') }}:</b>
            <RLinkExplorer :text="tokens.xrt.address" category="token" />
          </section>
          <table class="container-full table-hover">
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
    </div>
    <section class="t-align--center m-b-0">
      <a
        href="#"
        onclick="show(this, '#statistic', '&amp;uarr; Minimize &amp;uarr;', '&amp;darr; Expand &amp;darr;');return false;"
      >&darr; Expand &darr;</a>
    </section>
  </RCard>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState("token", ["tokens"]),
    ...mapState("statistics", ["connected", "totalSupply", "wn", "gas", "li"])
  }
};
</script>
