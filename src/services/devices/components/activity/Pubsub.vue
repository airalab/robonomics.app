<template>
  <div>
    <h3>Pubsub</h3>
    <div class="btns">
      <button @click="push" class="btn-sm">test push</button>
      <button @click="clear" :disabled="log.length === 0" class="btn-sm">
        clear messages
      </button>
    </div>
    <div v-if="log.length === 0">Not messages</div>
    <div class="items">
      <Pagination :listData="log" :currentPage="currentPage" @page="handlePage">
        <template v-slot:default="props">
          <Row :addr="addr" :value="props.item" />
        </template>
      </Pagination>
    </div>
  </div>
</template>

<script>
import Row from "./Row";
import Pagination from "./Pagination";
import { storageMsg, addByList } from "../../utils/storage";

const topic = "airalab.lighthouse.5.robonomics.eth";

export default {
  props: ["id"],
  components: {
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
  created() {
    if (this.id) {
      this.subscribe(this.id);
    }
    storageMsg.on((items) => {
      this.log = Object.prototype.hasOwnProperty.call(items, this.addr)
        ? items[this.addr]
        : [];
    });
  },
  watch: {
    id: function () {
      if (this.id) {
        this.subscribe(this.id);
      }
    }
  },
  destroyed() {
    this.$ipfs.pubsub.unsubscribe(topic, this.handlerMsg);
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
        Buffer.from(
          JSON.stringify({ time: Date.now(), id: this.addr, type: "web" })
        )
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
