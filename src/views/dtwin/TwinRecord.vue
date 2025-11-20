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
import { hexToCid } from "@/utils/string";
import { ref } from "vue";

/**
 * Converts a given token (hex-string) to a utf-8 encoded string.
 * @param {string} token - A token (hex-string).
 * @returns {string} The utf-8 encoded string.
 */
export const tokenToString = (token) => {
  token = token.replace(/^0x/, "").replace(/^00+/, "");
  if (token.length % 2 !== 0) {
    token = "0" + token;
  }
  return Buffer.from(token, "hex").toString("utf8");
};

/**
 * Converts a given token (hex-string) to a Content-Addressed Identifier (CID).
 * @param {string} token - A token (hex-string).
 * @returns {string} The Content-Addressed Identifier (CID).
 */
export const tokenToCid = (token) => {
  return hexToCid(token);
};

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
