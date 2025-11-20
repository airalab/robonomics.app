<template>
  <div v-if="twin">
    <twin-record
      v-for="(address, token) in twin"
      :key="token"
      :token="token"
      :address="address"
    />
  </div>
  <robo-status v-else type="warning">No entries</robo-status>
</template>

<script>
import { hexToCid } from "@/utils/string";
import { useTwin } from "robonomics-interface-vue/twin";
import { toRefs } from "vue";
import TwinRecord from "./TwinRecord.vue";

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
  props: ["id"],
  components: { TwinRecord },
  setup(props) {
    const { data: twin } = useTwin(toRefs(props).id);

    return {
      twin,
      tokenToCid,
      tokenToString
    };
  }
};
</script>
