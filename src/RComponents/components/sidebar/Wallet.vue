<template>
  <fragment>
    <section>
      <LinkExplorer v-if="account" :text="account" classStyle="nowrap" :chainid="networkId" />
      <div v-if="networkId" class="m-t-10">
        <Label class="align-top" :color="networkId === 1 ? 'green' : 'violet'">{{nameChain}}</Label>
      </div>
    </section>

    <section>
      <template v-for="(token, i) in tokens">
        <div :key="i" class="js-tooltip">
          <b class="m-r-10">{{token.amount}}</b>
          <span class="t-sm">{{token.symbol}}</span>
        </div>
        <hr v-if="i < tokens.length - 1" :key="`h-${i}`" />
      </template>
    </section>
  </fragment>
</template>

<script>
import LinkExplorer from "../LinkExplorer";
import Label from "../Label";

export default {
  props: {
    account: String,
    networkId: {
      type: Number,
      default: 1
    },
    tokens: Array
  },
  computed: {
    nameChain: function() {
      return this.networkId === 1 ? "Mainnet" : "Sidechain";
    }
  },
  components: {
    LinkExplorer,
    Label
  }
};
</script>
