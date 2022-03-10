<template>
  <div>
    <div class="block">
      <h4>Your subscription</h4>
      <div>
        <b>{{ countMonth }} Month</b>
      </div>
      <!-- <div v-if="isActive">Active</div>
      <div v-else>Not active</div> -->
      <div>Active till: {{ validUntilFormat }}</div>
      <div><b>Owner</b>: {{ owner }}</div>
    </div>
    <div class="block">
      <h4>Your devices</h4>
      <table class="container-full">
        <tr v-for="(device, i) in devices" :key="i">
          <td>{{ device.name }}</td>
          <td>{{ device.address }}</td>
          <td><button @click="remove(device.address)">remove</button></td>
        </tr>
        <tr>
          <td>
            <input
              v-model="newDeviceName"
              class="container-full"
              placeholder="Name"
              :class="{ error: err }"
            />
          </td>
          <td>
            <input
              v-model="newDeviceAddress"
              class="container-full"
              placeholder="Address"
              :class="{ error: err }"
            />
          </td>
          <td><button @click="add" class="btn-green">add</button></td>
        </tr>
      </table>
      <button
        @click="save"
        class="container-full"
        :disabled="!hasEdit || process"
      >
        <div class="loader-ring" v-if="process"></div>
        Save
      </button>
      <div v-if="error" class="red" style="margin-top: 10px">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import { Robonomics } from "@/utils/robonomics-substrate";
import { checkAddress } from "@polkadot/util-crypto";
import config from "../config";
import Storage from "@/utils/storage";

export const storage = new Storage("rws-devices");

export default {
  // beforeRouteEnter(to, from, next) {
  //   if (to.params.owner.length === 48) {
  //     next();
  //   } else {
  //     next("/");
  //   }
  // },
  props: {
    owner: {
      type: String,
      validator: function (v) {
        return v.length === 48;
      }
    }
  },
  data() {
    return {
      subscription: null,
      // subscription: {
      //   free_weight: 0,
      //   issue_time: "1,637,820,672,000",
      //   last_update: "1,637,820,672,000",
      //   kind: {
      //     Lifetime: {
      //       tps: 30
      //     }
      //   }
      // },
      devices: [],
      newDeviceName: "",
      newDeviceAddress: "",
      err: false,
      error: null,
      process: false,
      hasEdit: false
    };
  },
  computed: {
    countMonth() {
      if (this.subscription === null) {
        return 0;
      }
      let days = 0;
      if (this.subscription.value.kind.isDaily) {
        days = this.subscription.value.kind.value.days.toNumber();
      }
      return days / 30;
    },
    validUntil() {
      if (this.subscription === null) {
        return false;
      }
      const issue_time = this.subscription.value.issueTime.toNumber();
      let days = 0;
      if (this.subscription.value.kind.isDaily) {
        days = this.subscription.value.kind.value.days.toNumber();
      }
      return issue_time + days * (24 * 60 * 60 * 1000);
    },
    validUntilFormat() {
      if (this.subscription === null) {
        return "-";
      }
      return new Date(this.validUntil).toLocaleString();
    },
    isActive() {
      if (this.subscription === null || Date.now() > this.validUntil) {
        return false;
      }
      return true;
    }
  },
  created() {
    this.loadLadger();
    this.loadDevices();
  },
  methods: {
    async loadLadger() {
      const robonomics = Robonomics.getInstance(config.CHAIN);
      this.subscription = await robonomics.rws.getLedger(this.owner);
    },
    async loadDevices() {
      const robonomics = Robonomics.getInstance(config.CHAIN);
      const devices = await robonomics.rws.getDevices(this.owner);
      const devicesStore = storage.getItems()[this.owner] || [];
      this.devices = devices.map((item) => {
        return {
          name:
            devicesStore.find((device) => device.address === item.toHuman())
              .name || "",
          address: item.toHuman()
        };
      });
    },
    async save() {
      this.error = null;
      this.process = true;
      try {
        const robonomics = Robonomics.getInstance(config.CHAIN);
        await robonomics.accountManager.selectAccountByAddress(this.owner);
        const tx = await robonomics.rws.setDevices(
          this.devices.map((item) => item.address)
        );
        const resultTx = await robonomics.accountManager.signAndSend(tx);
        console.log("saved block", resultTx.block, resultTx.tx);
        storage.addItem(this.owner, this.devices);
        this.loadDevices();
        this.process = false;
      } catch (e) {
        console.log(e);
        this.error = e.message;
        this.process = false;
      }
      this.hasEdit = false;
    },
    add() {
      this.err = false;
      if (
        this.newDeviceAddress &&
        this.newDeviceAddress.length === 48 &&
        this.devices.findIndex(
          (item) => item.address === this.newDeviceAddress
        ) < 0 &&
        checkAddress(
          this.newDeviceAddress,
          Robonomics.getInstance(config.CHAIN).api.registry.chainSS58
        )[0]
      ) {
        this.devices.push({
          name: this.newDeviceName,
          address: this.newDeviceAddress
        });
        this.newDeviceName = "";
        this.newDeviceAddress = "";
        this.hasEdit = true;
      } else {
        this.err = true;
      }
    },
    remove(device) {
      this.devices = this.devices.filter((item) => item.address !== device);
      this.hasEdit = true;
    }
  }
};
</script>

<style scoped>
.block {
  margin: 20px 0;
}
.block h4 {
  margin-bottom: 5px;
}
.block table {
  margin-top: 0;
}
</style>
