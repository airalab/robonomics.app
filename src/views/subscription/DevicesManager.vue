<template>
  <robo-grid-item>
    <robo-section>
      <robo-card
        back-image="images/card-back-sample.png"
        back-position="100% 100%"
        back-size="contain"
      >
        <robo-card-label>
          <robo-card-label-section>
            Subscription summary
          </robo-card-label-section>
          <robo-card-label-section info>
            {{ $apptextSubscriptionInfo }}
          </robo-card-label-section>
        </robo-card-label>
        <robo-card-section>
          <robo-card-title>
            <robo-status type="success" :textRight="`${countMonth} month`" />
          </robo-card-title>
          <robo-list>
            <robo-list-item>
              <robo-text weight="bold">
                Active till: {{ validUntilFormat }}
              </robo-text>
            </robo-list-item>
            <robo-list-item>
              <robo-text weight="bold">
                Owner:
                <robo-account-polkadot short inline />
              </robo-text>
            </robo-list-item>
          </robo-list>
        </robo-card-section>
      </robo-card>
    </robo-section>

    <robo-section>
      <robo-card>
        <robo-card-label>
          <robo-card-label-section>Manage access</robo-card-label-section>
        </robo-card-label>
        <robo-card-section>
          <robo-section offset="x1">
            <robo-text>
              Manage here addresses that can send transactions using your
              subscription (Users, IoT devices etc.)
            </robo-text>
          </robo-section>

          <robo-section offset="x1">
            <robo-template-subsription-item
              v-for="(device, i) in devices"
              :key="i"
              v-model:address="device.address"
              v-model:name="device.name"
              status="added"
              @on-delete="
                (deleteStarted, deleteStatus) =>
                  remove(device.address, deleteStarted, deleteStatus)
              "
              @on-edit="editName"
              :disabled="process"
              tipName="The name will be saved only for this browser"
            />
            <robo-template-subsription-item
              v-model:address="newDeviceAddress"
              v-model:name="newDeviceName"
              @on-add="add"
              :disabled="process"
              :key="itemKey"
              tipName="The name will be saved only for this browser"
            />
          </robo-section>
        </robo-card-section>
      </robo-card>
    </robo-section>
  </robo-grid-item>
</template>

<script>
import { checkAddress } from "@polkadot/util-crypto";
import Storage from "@/utils/storage";
import robonomics from "../../robonomics";

export const storage = new Storage("rws-devices");

export default {
  data() {
    return {
      owner: null,
      subscription: null,
      devices: [],
      newDeviceName: "",
      newDeviceAddress: "",
      error: null,
      process: false,
      unsubscribeAccount: null,
      itemKey: 1
    };
  },
  computed: {
    countMonth() {
      if (this.subscription === null) {
        return 0;
      }
      let days = 0;
      if (this.subscription.kind.isDaily) {
        days = this.subscription.kind.value.days.toNumber();
      }
      return days / 30;
    },
    validUntil() {
      if (this.subscription === null) {
        return false;
      }
      const issue_time = this.subscription.issueTime.toNumber();
      let days = 0;
      if (this.subscription.kind.isDaily) {
        days = this.subscription.kind.value.days.toNumber();
      }
      return issue_time + days * (24 * 60 * 60 * 1000);
    },
    validUntilFormat() {
      if (this.subscription === null) {
        return "-";
      }
      return new Date(this.validUntil).toLocaleDateString();
    },
    isActive() {
      if (this.subscription === null || Date.now() > this.validUntil) {
        return false;
      }
      return true;
    },
    isAddressExists() {
      if (
        this.devices.findIndex(
          (item) => item.address === this.newDeviceAddress
        ) < 0
      ) {
        return false;
      }
      return true;
    },
    validNewAddress() {
      if (
        this.newDeviceAddress &&
        this.newDeviceAddress.length === 48 &&
        checkAddress(
          this.newDeviceAddress,
          robonomics.api.registry.chainSS58
        )[0]
      ) {
        return true;
      }
      return false;
    }
  },
  created() {
    if (robonomics.accountManager.account) {
      this.owner = robonomics.accountManager.account.address;
      this.loadLadger();
      this.loadDevices();
    }
    this.unsubscribeAccount = robonomics.accountManager.onChange((account) => {
      this.owner = account.address;
      this.loadLadger();
      this.loadDevices();
    });
  },
  unmounted() {
    if (this.unsubscribeAccount) {
      this.unsubscribeAccount();
    }
  },
  methods: {
    async loadLadger() {
      const subscription = await robonomics.rws.getLedger(this.owner);
      if (!subscription.isEmpty) {
        this.subscription = subscription.value;
        if (!this.isActive) {
          this.$router.push({ name: "subscription-bid" });
        }
      } else {
        this.$router.push({ name: "subscription-bid" });
      }
    },
    async loadDevices() {
      const devicesStore = storage.getItems()[this.owner] || [];
      const devices = await robonomics.rws.getDevices(this.owner);
      this.devices = devices.map((item) => {
        const device = devicesStore.find(
          (device) => device.address === item.toHuman()
        );
        return {
          name: device ? device.name : "",
          address: item.toHuman()
        };
      });
      this.newDeviceName = `Account-${this.devices.length + 1}`;
    },
    async save(devices) {
      this.error = null;
      this.process = true;
      try {
        const tx = await robonomics.rws.setDevices(
          devices.map((item) => item.address)
        );
        const resultTx = await robonomics.accountManager.signAndSend(tx);
        console.log("saved block", resultTx.block, resultTx.tx);
        storage.addItem(this.owner, devices);
        await this.loadDevices();
        this.process = false;
      } catch (e) {
        console.log(e);
        this.error = e.message;
        this.process = false;
      }
    },
    async add(addStarted, addStatus) {
      addStarted();
      if (!this.validNewAddress) {
        addStatus(false, "Check the address, incorrect format");
        return;
      }
      if (this.isAddressExists) {
        addStatus(false, "This address already exists");
        return;
      }
      const devices = [...this.devices];
      devices.push({
        name: this.newDeviceName,
        address: this.newDeviceAddress
      });
      await this.save(devices);
      this.newDeviceName = `Account-${devices.length + 1}`;
      this.newDeviceAddress = "";
      addStatus(true);
      this.itemKey += 1;
    },
    async remove(device, deleteStarted, deleteStatus) {
      deleteStarted();
      const devices = this.devices.filter((item) => item.address !== device);
      await this.save(devices);
      deleteStatus(true);
    },
    editName(editStarted, editStatus) {
      editStarted();
      storage.addItem(this.owner, this.devices);
      editStatus(true);
    }
  }
};
</script>
