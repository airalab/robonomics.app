<template>
  <RCard class="window" id="window-lighthouse-providers">
    <div class="window-head">
      <span>{{ $t("lighthouse.providers.title") }}</span>
      <a class="window-head-toggle" href="#">–</a>
    </div>
    <div class="window-content">
      <table class="container-full table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t("lighthouse.providers.address") }}</th>
            <th>{{ $t("lighthouse.providers.quota") }}</th>
            <th>{{ $t("lighthouse.providers.balance") }}</th>
            <th>{{ $t("lighthouse.providers.status") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.i" :class="{disabled: member.i != marker}">
            <td>
              <span v-if="member.i == marker" style="font-weight: bold;color: #03a5ed;">&gt;</span>
              {{ member.i }}
            </td>
            <td>
              <RChainExplorer :address="member.address" />
            </td>
            <td>
              <template v-if="member.i == marker">{{ quota }} / {{ member.quota }}</template>
              <template v-else>{{ member.quota }} / {{ member.quota }}</template>
            </td>
            <td>{{ member.balance }} ETH</td>
            <td>
              <template v-if="member.last">
                <span>
                  {{ $t("lighthouse.providers.last", { blocks: currentBlock - member.last }) }}
                  <RChainExplorer category="tx" :address="member.lastTx" :isAvatar="false" />
                </span>
              </template>
              <template v-else-if="minBlock > 0">
                <span>{{ $t("lighthouse.providers.more", { blocks: currentBlock - minBlock }) }}</span>
              </template>
              <template v-else>
                <span>{{ $t("lighthouse.providers.more", { blocks: timeoutInBlocks }) }}</span>
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
      "timeoutInBlocks",
      "currentBlock",
      "minBlock"
    ])
  }
};
</script>
