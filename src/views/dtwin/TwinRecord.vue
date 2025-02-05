<template>
  <div class="record">
    <div class="type">
      <button :class="{ active: type === 'hex' }" @click="type = 'hex'">
        hex
      </button>
      <button :class="{ active: type === 'ipfs' }" @click="type = 'ipfs'">
        ipfs
      </button>
      <button :class="{ active: type === 'text' }" @click="type = 'text'">
        text
      </button>
    </div>
    <div class="token">
      <span v-if="type === 'hex'">{{ token }} </span>
      <span v-if="type === 'ipfs'">{{ tokenToCid(token) }} </span>
      <span v-if="type === 'text'">{{ tokenToString(token) }} </span>
    </div>
    <div>{{ address }}</div>
    <router-link
      v-if="
        token ===
        '0x000000000000000000000000000000000000000000000000616c747275697374'
      "
      :to="`/altruist/${address}`"
    >
      » altruist
    </router-link>
  </div>
</template>

<script>
import { ref } from "vue";
import { tokenToCid, tokenToString } from "../dtwin/dtwin";

export default {
  props: ["token", "address"],
  setup() {
    const type = ref("hex");

    return {
      type,
      tokenToCid,
      tokenToString
    };
  }
};
</script>

<style scoped>
.record {
  background-color: #fff;
  border: 1px solid #036ffc;
  padding: 10px;
  margin: 10px 0;
}
.token {
  font-size: 14px;
}
.type {
  margin: -10px 0 5px -10px;
}
.type button {
  border: 0;
  padding: 10px;
}
.type button:hover,
.type button.active {
  cursor: pointer;
  background-color: #036ffc;
  color: #fff;
}
</style>
