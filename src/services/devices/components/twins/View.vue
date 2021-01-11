<template>
  <RCard class="section-centered">
    <div style="overflow: hidden">
      <h1 style="float: left">Digital twin</h1>
    </div>

    {{ account }}
    <!-- <SearchForm ref="form" :addr="account" @addr="handleForm" /> -->
    <hr />

    <div v-if="addr && schema" class="items">
      <div class="btns">
        <button @click="clear" :disabled="log.length === 0" class="btn-sm">
          clear
        </button>
      </div>
      <div v-if="log.length === 0">Not messages</div>
      <div class="items">
        <Pagination
          :listData="log"
          :currentPage="currentPage"
          @page="handlePage"
        >
          <template v-slot:default="props">
            <Row :schema="schema" :value="props.item" />
          </template>
        </Pagination>
      </div>
    </div>
  </RCard>
</template>

<script>
// import SearchForm from "./SearchForm";
import Row from "./Row";
import Pagination from "./Pagination";
import { storageMsg, addByList, storageTwins } from "../../utils/storage";
import { subscribeDatalog } from "../../../../utils/substrate";
import { u8aToString } from "@polkadot/util";

export default {
  props: ["account"],
  components: {
    // SearchForm,
    Row,
    Pagination
  },
  data() {
    return {
      addr: "",
      schema: null,
      log: [],
      currentPage: 0,
      unsubscribe: null
    };
  },
  mounted() {
    if (this.account) {
      const list = storageTwins.getItems();
      this.schema = JSON.parse(list[this.account]);

      this.subscribe(this.account);
    }
    storageMsg.on((items) => {
      this.log = Object.prototype.hasOwnProperty.call(items, this.addr)
        ? items[this.addr]
        : [];
    });
  },
  async beforeDestroy() {
    if (this.unsubscribe) {
      await this.unsubscribe();
    }
  },
  methods: {
    save(from, time, data) {
      addByList(from, {
        data,
        time: time
      });
    },
    handlerMsg(msg) {
      this.save(this.addr, msg[0].toString(), u8aToString(msg[1]));
    },
    handleForm(addr) {
      if (addr !== this.addr) {
        this.$router.push({ name: "iot-twin-show", params: { account: addr } });
        this.subscribe(addr);
      }
    },
    async subscribe(addr) {
      if (this.unsubscribe) {
        await this.unsubscribe();
      }
      this.log = [];
      this.addr = addr;

      const items = storageMsg.getItems();
      this.log = Object.prototype.hasOwnProperty.call(items, this.addr)
        ? items[this.addr]
        : [];

      this.unsubscribe = await subscribeDatalog(
        addr,
        (res) => {
          res.forEach((item) => {
            this.handlerMsg(item);
          });
        }
        // { pos: 0, time: "1606373183000" }
      );
    },
    handlePage(page) {
      this.currentPage = page;
    },
    clear() {
      storageMsg.removeItem(this.addr);
    }
  }
};
</script>

<style scoped>
.items {
  margin: 10px 0;
}
.btns {
  text-align: right;
}
.btns button {
  margin-left: 10px;
}
</style>
