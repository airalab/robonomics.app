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
              v-for="(device, i) in tmpDevices"
              :key="i"
              v-model:address="device.address"
              v-model:name="device.name"
              status="added"
              @on-delete="
                (deleteStarted, deleteStatus) =>
                  remove(device.address, deleteStarted, deleteStatus)
              "
              @on-edit="editName"
              :disabled="tx.process.value"
              tipName="The name will be saved only for this browser"
            />
            <robo-template-subsription-item
              v-model:address="newDeviceAddress"
              v-model:name="newDeviceName"
              @on-add="add"
              :disabled="tx.process.value"
              :key="itemKey"
              tipName="The name will be saved only for this browser"
            />
          </robo-section>
          <robo-section offset="x1">
            <robo-button
              block
              size="big"
              type="ok"
              @click="saveToChain"
              :disabled="!hasChanged || process"
              :loading="process"
              >Save</robo-button
            >
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
import { useSend } from "@/hooks/useSend";
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

    const tx = useSend();
    const save = async (devices) => {
      const call = await robonomics.rws.setDevices(
        devices.map((item) => item.address)
      );
      await tx.send(call);
      storage.addItem(owner.value, devices);
      await loadDevices(owner.value);
    };

    return {
      owner,
      subscription,
      devices,
      loadDevices,
      tx,
      save
    };
  },

  data() {
    return {
      tmpDevices: [],
      process: false,
      newDeviceName: "",
      newDeviceAddress: "",
      itemKey: 1
    };
  },
  watch: {
    devices() {
      this.newDeviceName = `Account-${this.maxIndex(this.devices) + 1}`;
      this.tmpDevices = [...this.devices];
    }
  },
  computed: {
    hasChanged() {
      function diff(a, b) {
        return [
          ...a.filter((x) => !b.includes(x)),
          ...b.filter((x) => !a.includes(x))
        ];
      }
      if (
        diff(
          this.tmpDevices.map((a) => a.address),
          this.devices.map((a) => a.address)
        ).length
      ) {
        return true;
      }
      return false;
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
  methods: {
    maxIndex(list) {
      let maxIndex = 0;
      if (list.length > 0) {
        const asd = list.map((a) => Number(a.name.replaceAll(/[^0-9]/gi, "")));
        let max = Math.max(...asd);
        if (max > 0) {
          maxIndex = max;
        }
      }
      return maxIndex;
    },
    async saveToChain() {
      this.process = true;
      try {
        await this.save(this.tmpDevices);
      } catch (error) {
        console.log(error);
      }
      this.process = false;
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
      this.tmpDevices.push({
        name: this.newDeviceName,
        address: this.newDeviceAddress
      });
      this.newDeviceName = `Account-${this.maxIndex(this.tmpDevices) + 1}`;
      this.newDeviceAddress = "";
      addStatus(true);
      this.itemKey += 1;
    },
    async remove(device) {
      this.tmpDevices = this.tmpDevices.filter(
        (item) => item.address !== device
      );
      this.newDeviceName = `Account-${this.maxIndex(this.tmpDevices) + 1}`;
    },
    editName(editStarted, editStatus) {
      editStarted();
      storage.addItem(this.owner, this.devices);
      this.newDeviceName = `Account-${this.maxIndex(this.tmpDevices) + 1}`;
      editStatus(true);
    }
  }
};
</script>
