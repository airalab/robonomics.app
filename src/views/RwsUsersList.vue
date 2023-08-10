<template>
  <robo-layout-section
    v-if="rws?.length < 1 || !users || users.length < 1"
    rwsrecover
  >
    <robo-section width="narrow" gcenter>
      <robo-template-rws-activeselect
        v-if="rws?.length > 1"
        block
        label="Selected RWS"
      />
      <robo-template-rws-users-empty />
    </robo-section>
  </robo-layout-section>

  <robo-layout-section v-else rwsrecover rwssave>
    <robo-section offset="x0" width="narrow">
      <robo-grid offset="x1" gap="x1">
        <robo-template-rws-user-listitem
          v-for="(user, index) in users"
          :key="index"
          :owner="rwsactive"
          v-model:address="user.address"
          v-model:name="user.name"
          :onEdit="onEdit"
          @onUserDelete="(setStatus) => onDelete(user.address, setStatus)"
        />
      </robo-grid>
      <robo-button
        block
        :router="store.state.robonomicsUIvue.rws.links.useractivate"
      >
        + Add user
      </robo-button>
    </robo-section>
  </robo-layout-section>
</template>

<script setup>
import { useDevices } from "@/hooks/useDevices";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import { computed, watch } from "vue";
import { useStore } from "vuex";

const store = useStore();

const rws = computed(() => {
  return store.state.robonomicsUIvue.rws.list;
});

const rwsactive = computed(() => {
  return store.state.robonomicsUIvue.rws.active;
});

const users = computed(() => {
  try {
    return store.getters["rws/users"];
  } catch (error) {
    return [];
  }
});

const onEdit = (setStatus) => {
  setStatus("ok");
};

const robonomics = useRobonomics();
const tx = useSend();
const devices = useDevices(rwsactive);

const onDelete = async (address, setStatus) => {
  if (
    rwsactive.value &&
    rwsactive.value !== store.state.robonomicsUIvue.polkadot.address
  ) {
    setStatus("error", "You do not have access to this action.");
    return;
  }

  if (devices.devices.value.includes(address)) {
    const newListDevices = devices.devices.value.filter((item) => {
      return item !== address;
    });
    const call = await robonomics.rws.setDevices(newListDevices);
    await tx.send(call);
    if (tx.error.value) {
      if (tx.error.value !== "Cancelled") {
        setStatus("error", tx.error.value);
      } else {
        setStatus("calcel");
      }
      return;
    }
    await devices.loadDevices();
  }
  setStatus("ok");
};

const fillStorage = () => {
  for (const address of devices.devices.value) {
    if (
      !users.value.find((item) => {
        return item.address === address;
      })
    ) {
      store.dispatch("rws/addUser", {
        rws: devices.owner.value,
        user: {
          address: address,
          name: address === devices.owner.value ? "owner" : ""
        }
      });
    }
  }
  for (const item of users.value) {
    if (
      !devices.devices.value.find((address) => {
        return item.address === address;
      })
    ) {
      store.dispatch("rws/deleteUser", {
        rws: devices.owner.value,
        user: item.address
      });
    }
  }
};
watch(devices.devices, fillStorage);
</script>
