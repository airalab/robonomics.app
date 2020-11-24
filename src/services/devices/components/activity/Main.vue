<template>
  <RCard class="section-centered">
    <div style="overflow: hidden">
      <h1 style="float: left">Telemetry</h1>
    </div>

    <SearchForm ref="form" :addr="id" @addr="handleForm" />
    <hr />

    <div v-if="addr" class="items">
      <div class="btns">
        <button @click="push" class="btn-sm">test push</button>
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
            <Row :addr="addr" :value="props.item" />
          </template>
        </Pagination>
      </div>
    </div>
  </RCard>
</template>

<script>
import SearchForm from "./SearchForm";
import Row from "./Row";
import Pagination from "./Pagination";
import { storageMsg, addByList } from "../../utils/storage";

const topic = "airalab.lighthouse.5.robonomics.eth";

export default {
  props: ["id"],
  components: {
    SearchForm,
    Row,
    Pagination
  },
  data() {
    return {
      addr: "",
      log: [],
      currentPage: 0
    };
  },
  mounted() {
    if (this.id) {
      this.subscribe(this.id);
    }
    storageMsg.on((items) => {
      this.log = Object.prototype.hasOwnProperty.call(items, this.addr)
        ? items[this.addr]
        : [];
    });
    // setTimeout(() => {
    //   this.save(this.addr, Date.now());
    //   // updateByList(this.addr, 1, {
    //   //   substrate: { account: "address", block: "1", tx: "2" }
    //   // });
    // }, 3000);
  },
  methods: {
    save(from, data) {
      addByList(from, {
        data,
        time: Date.now(),
        eth: null,
        substrate: null
      });
    },
    handlerMsg(msg) {
      const data = msg.data.toString();
      if (msg.from === this.addr) {
        this.save(this.addr, data);
      } else {
        try {
          const json = JSON.parse(data);
          if (json.id && json.id === this.addr) {
            this.save(this.addr, data);
          }
        } catch (error) {
          console.log(data);
        }
      }
    },
    handleForm(addr) {
      if (addr !== this.addr) {
        this.$router.push({ name: "iot-activity", params: { id: addr } });
        this.subscribe(addr);
      }
    },
    subscribe(addr) {
      this.$ipfs.pubsub.unsubscribe(topic, this.handlerMsg);
      this.log = [];
      this.addr = addr;
      const items = storageMsg.getItems();
      this.log = Object.prototype.hasOwnProperty.call(items, this.addr)
        ? items[this.addr]
        : [];
      this.$ipfs.pubsub.subscribe(topic, this.handlerMsg);
    },
    handlePage(page) {
      this.currentPage = page;
    },
    push() {
      this.$ipfs.pubsub.publish(
        topic,
        JSON.stringify({ time: Date.now(), id: this.addr, type: "web" })
      );
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
