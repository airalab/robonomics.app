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
            <robo-status
              type="success"
              :textRight="`${subscription.countMonth.value} month`"
            />
          </robo-card-title>
          <robo-list>
            <robo-list-item>
              <robo-text weight="bold">
                Active till: {{ subscription.validUntilFormat }}
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
    <related-services />
  </robo-grid-item>
</template>

<script>
import { onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAccount } from "@/hooks/useAccount";
import { useSubscription } from "@/hooks/useSubscription";
import { useDevices, storage } from "@/hooks/useDevices";
import { checkAddress } from "@polkadot/util-crypto";
import robonomics from "../../robonomics";
import RelatedServices from "./RelatedServices.vue";

export default {
  components: { RelatedServices },
  setup() {
    const { account: owner, unsubscribe } = useAccount();
    onUnmounted(() => {
      unsubscribe();
    });

    const subscription = useSubscription(owner);
    const { devices, loadDevices } = useDevices(owner);
    const router = useRouter();

    watch(
      subscription.subscription,
      (newValue, oldValue) => {
        if (oldValue === undefined) {
          return;
        }
        if (newValue === null || !subscription.isActive.value) {
          router.push({ name: "subscription-bid" });
        }
      },
      { immediate: true }
    );

    return {
      owner,
      subscription,
      devices,
      loadDevices
    };
  },

  data() {
    return {
      newDeviceName: "",
      newDeviceAddress: "",
      error: null,
      process: false,
      itemKey: 1
    };
  },
  watch: {
    devices() {
      this.newDeviceName = `Account-${this.devices.length + 1}`;
    }
  },
  computed: {
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
  methods: {
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
        await this.loadDevices(this.owner);
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
