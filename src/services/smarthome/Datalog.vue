<template>
  <robo-grid-item>
    <robo-card allowExpand>
      <robo-card-label>
        <robo-card-label-section>SmartHome Telemetry</robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <div v-if="isLoad">...</div>
        <div v-if="log.length">
          <robo-list gap="x2" fullLine>
            <robo-list-item>
              <robo-text weight="light">
                Your secret key for decrypt message
              </robo-text>
              <robo-input v-model="uri" type="password" />
              <div v-if="!validateUri">Input your secret key</div>
            </robo-list-item>
          </robo-list>

          <table class="table">
            <Pagination :size="5" :listData="log" :currentPage="currentPage">
              <template v-slot:default="props">
                <tr>
                  <td style="width: 150px">
                    {{ props.item.time }}
                  </td>
                  <td style="width: 100%">
                    <div
                      v-if="props.item.crypt === null"
                      :title="props.item.data"
                    >
                      {{ props.item.data.substr(0, 5) }}...{{
                        props.item.data.substr(-5)
                      }}
                    </div>
                    <div
                      v-if="props.item.crypt && props.item.decrypt === null"
                      :title="props.item.crypt"
                    >
                      {{ props.item.crypt.substr(0, 5) }}...{{
                        props.item.crypt.substr(-5)
                      }}
                    </div>
                    <pre
                      style="max-height: 200px"
                    ><code v-if="props.item.decrypt"> {{ props.item.decrypt }} </code></pre>
                  </td>
                  <td style="width: 100px">
                    <robo-button
                      v-if="
                        props.item.crypt === null &&
                        props.item.data.substr(0, 2) === 'Qm'
                      "
                      @click="readByIndex(props.item.id)"
                      :disabled="props.item.load"
                      :loading="props.item.load"
                    >
                      read
                    </robo-button>
                    <robo-button
                      v-if="props.item.crypt && props.item.decrypt === null"
                      @click="decryptByIndex(props.item.id)"
                      :disabled="!validateUri"
                    >
                      decrypt
                    </robo-button>
                  </td>
                </tr>
              </template>

              <template v-slot:pagination="props">
                <tr>
                  <td colspan="3" style="text-align: center">
                    <robo-button
                      :disabled="props.pageNumber === 0"
                      @click="prevPage"
                    >
                      Previous
                    </robo-button>
                    &nbsp;
                    <b>
                      {{ props.pageCount > 0 ? props.pageNumber + 1 : 0 }} /
                      {{ props.pageCount }}
                    </b>
                    &nbsp;
                    <robo-button
                      :disabled="props.pageNumber >= props.pageCount - 1"
                      @click="nextPage"
                    >
                      Next
                    </robo-button>
                  </td>
                </tr>
              </template>
            </Pagination>
          </table>
        </div>
      </robo-card-section>
    </robo-card>
  </robo-grid-item>
</template>

<script>
import robonomics from "../../robonomics";
import { Keyring } from "@polkadot/keyring";
import { u8aToString } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";
import { catFile } from "../../ipfs";
import Pagination from "./Pagination";

export default {
  components: { Pagination },
  props: ["address"],
  data() {
    return {
      isLoad: false,
      log: [],
      uri: "",
      currentPage: 0,
      unsubscribe: null
    };
  },
  watch: {
    address() {
      this.read();
    }
  },
  async created() {
    await this.read();
    this.unsubscribe = await robonomics.datalog.on({}, (result) => {
      result
        .filter((item) => item.account.toHuman() === this.address)
        .forEach((item) => {
          this.log.unshift({
            time: new Date(item.moment.toNumber()).toLocaleString(),
            data: item.data.toHuman(),
            crypt: null,
            decrypt: null,
            load: false,
            id: this.log.length + 2
          });
        });
    });
  },
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  computed: {
    account() {
      if (this.uri) {
        try {
          const k = new Keyring();
          const a1 = k.addFromUri(this.uri, {}, "ed25519");
          if (encodeAddress(this.address) === encodeAddress(a1.address)) {
            return a1;
          }
          const a2 = k.addFromUri(this.uri, {}, "sr25519");
          if (encodeAddress(this.address) === encodeAddress(a2.address)) {
            return a2;
          }
          return a1;
        } catch (error) {
          console.log(error);
        }
      }
      return null;
    },
    validateUri() {
      if (
        this.account &&
        encodeAddress(this.address) === encodeAddress(this.account.address)
      ) {
        return true;
      }
      return false;
    }
  },
  methods: {
    nextPage() {
      this.currentPage++;
    },
    prevPage() {
      this.currentPage--;
    },
    handlePage(page) {
      this.currentPage = page;
    },
    async read() {
      this.isLoad = true;
      const log = await robonomics.datalog.read(this.address);
      this.log = log.reverse().map((item, id) => {
        return {
          time: new Date(item[0].toNumber()).toLocaleString(),
          data: item[1].toHuman(),
          crypt: null,
          decrypt: null,
          load: false,
          id
        };
      });
      this.isLoad = false;
    },
    async readByIndex(id) {
      const i = this.log.findIndex((item) => item.id === id);
      this.log[i].load = true;
      try {
        this.log[i].crypt = await catFile(this.log[i].data);
        this.log[i].load = false;
      } catch (error) {
        console.log(error);
        this.readByIndex(i);
      }
    },
    decryptByIndex(id) {
      const i = this.log.findIndex((item) => item.id === id);
      try {
        const msg = this.decrypt(this.log[i].crypt);
        try {
          this.log[i].decrypt = JSON.stringify(JSON.parse(msg), null, 4);
        } catch (error) {
          console.log(error);
          this.log[i].decrypt = msg;
        }
      } catch (error) {
        console.log(error);
      }
    },
    decrypt(encryptMessage) {
      const decryptMessage = this.account.decryptMessage(
        encryptMessage,
        this.account.publicKey
      );
      return u8aToString(decryptMessage);
    }
  }
};
</script>

<style scoped>
.table tr {
  border-bottom: 1px solid #eee;
}
.table td {
  padding: 10px;
}
</style>
