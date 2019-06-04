<template>
  <section :class="{ 'section-disabled': Object.values(nodes).length===0 }">
    <h2>Robonomics Telemetry</h2>
    <p v-if="Object.values(nodes).length===0">
      <span class="loader-ring align-vertical m-r-15"></span>
      <b class="align-vertical t-uppercase">{{ $t('waiting') }}</b>
    </p>
    <table class="container-full table-striped">
      <thead>
        <tr>
          <th>ipns</th>
          <th>address eth</th>
          <th>{{ $t('lighthouse_h') }}</th>
          <th>{{ $t('provider') }}</th>
          <th>{{ $t('peers') }}</th>
          <th>{{ $t('date') }}</th>
          <th>{{ $t('network') }}</th>
        </tr>
      </thead>
      <tbody>
        <td v-if="Object.values(nodes).length===0" colspan="7">{{ $t('no_data') }}</td>
        <tr v-else v-for="item in Object.values(nodes)" :key="item.id">
          <td>
            <a :href="`https://ipfs.io/ipns/${item.id}`" target="_blank">{{item.id}}</a>
          </td>
          <td>
            <a
              v-if="item.address"
              :href="`http://etherscan.io/address/${item.address}`"
              target="_blank"
            >{{item.address}}</a>
            <span v-else>-</span>
          </td>
          <td>
            <span v-if="item.lighthouse">{{item.lighthouse}}</span>
            <span v-else>-</span>
          </td>
          <td>
            <span v-if="item.provider">+</span>
            <span v-else>-</span>
          </td>
          <td>
            <span v-if="item.peers">{{item.peers.length}}</span>
            <span v-else>-</span>
          </td>
          <td>
            <span v-if="item.date">{{item.date}}</span>
            <span v-else>-</span>
          </td>
          <td>
            <span v-if="item.network">{{item.network}}</span>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: mapState({
    nodes: state => state.net.nodes
  })
};
</script>

<style>
.v-datatable__progress th {
  padding: 0;
}
</style>
