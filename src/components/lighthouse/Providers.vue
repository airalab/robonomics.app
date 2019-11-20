<template>
  <RCard class="window" id="window-lighthouse-providers">
    <div class="window-head">
      <span>Providers</span>
      <a class="window-head-toggle" href="#">–</a>
    </div>
    <div class="window-content">
      <table class="container-full table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Address</th>
            <th>Quota</th>
            <th>Balance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.i">
            <td>{{ member.i }}</td>
            <td>
              <RLinkExplorer :text="member.address" />
            </td>
            <td>
              <template v-if="member.i == marker"
                >{{ quota }} / {{ member.quota }}</template
              >
              <template v-else>{{ member.quota }}</template>
            </td>
            <td>{{ member.balance }} ETH</td>
            <td>
              <template v-if="member.i == marker">
                <span
                  v-if="
                    quota > 0 && timeoutInBlocks < currentBlock - keepAliveBlock
                  "
                  >Sleeping</span
                >
                <span v-else-if="member.last !== null"
                  >Provider sent tx {{ currentBlock - member.last }} blocks
                  ago</span
                >
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </RCard>
</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  props: ["lighthouse"],
  computed: {
    ...mapGetters("providers", ["members"]),
    ...mapState("providers", [
      "quota",
      "marker",
      "keepAliveBlock",
      "timeoutInBlocks",
      "currentBlock"
    ])
  }
};
</script>
