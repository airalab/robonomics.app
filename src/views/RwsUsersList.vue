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
          @on-user-delete="onDelete"
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

const onDelete = (setStatus) => {
  setStatus("ok");
};

const devices = useDevices(rwsactive);
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
