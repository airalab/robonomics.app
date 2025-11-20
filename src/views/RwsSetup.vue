<template>
  <robo-layout-section>
    <robo-section width="narrow" centered>
      <robo-text title="3" offset="x1">Saved subscription setups</robo-text>

      <robo-tabs v-if="$store.state.robonomicsUIvue.rws.list.length > 1">
        <robo-tab label="Active subscription">
          <robo-rws-setup
            :onUserDelete="removeUser"
            :onUserAdd="addUser"
            :onSaveHapass="saveHapass"
            :onControllerEdit="editController"
          />
        </robo-tab>
        <robo-tab label="All subscriptions">
          <robo-rws-setups-list />
        </robo-tab>
      </robo-tabs>

      <robo-rws-setup
        v-else
        :onUserDelete="removeUser"
        :onUserAdd="addUser"
        :onSaveHapass="saveHapass"
        :onControllerEdit="editController"
      />
    </robo-section>
  </robo-layout-section>
</template>

<script>
import { u8aToHex } from "@polkadot/util";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { usePolkadotApi } from "robonomics-interface-vue";
import { useAccount, useSend } from "robonomics-interface-vue/account";
import { useAction as useActionDatalog } from "robonomics-interface-vue/datalog";
import {
  useAction as useActionDevices,
  useDevices
} from "robonomics-interface-vue/devices";
import { computed } from "vue";
import { useStore } from "vuex";
import { useAccounts } from "../hooks/useAccounts";

export default {
  setup() {
    const store = useStore();

    const setupOwner = computed(() => {
      return store.state.robonomicsUIvue.rws.active;
    });

    const { isConnected } = usePolkadotApi();
    const { account, setSubscription } = useAccount();
    const { data: dataDevices } = useDevices(account);
    const { tx } = useSend();
    const actionDevices = useActionDevices();
    const actionDatalog = useActionDatalog();
    const { setFromPair, setSender, encryptor } = useAccounts();

    const setUser = async (
      user,
      setStatus,
      { skipDuplicateCheck = false } = {}
    ) => {
      if (!isConnected.value) {
        setStatus("error", "Parachain is not ready.");
        return;
      }
      if (setupOwner.value && setupOwner.value !== account.value) {
        setStatus("error", "You do not have access to this action.");
        return;
      }
      if (dataDevices.value.includes(user)) {
        if (!skipDuplicateCheck) {
          setStatus("error", "The address is already in the subscription.");
          return;
        } else {
          setStatus("ok");
          return;
        }
      }

      setSubscription(account.value);
      await tx.send(actionDevices.add(dataDevices.value, user));
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          setStatus("error", tx.error.value);
        } else {
          setStatus("cancel");
        }
        return;
      }
      store.commit("rws/setUsers", dataDevices);
      setStatus("ok");
    };

    const addUser = async (user, setStatus) => {
      return setUser(user, setStatus, { skipDuplicateCheck: false });
    };

    const editController = async (user, setStatus) => {
      return setUser(user, setStatus, { skipDuplicateCheck: true });
    };

    const removeUser = async (user, setStatus) => {
      if (!isConnected.value) {
        setStatus("error", "Parachain is not ready.");
        return;
      }
      if (setupOwner.value && setupOwner.value !== account.value) {
        setStatus("error", "You do not have access to this action.");
        return;
      }
      if (dataDevices.value.includes(user)) {
        setSubscription(account.value);
        await tx.send(actionDevices.remove(dataDevices.value, user));
        if (tx.error.value) {
          if (tx.error.value !== "Cancelled") {
            setStatus("error", tx.error.value);
          } else {
            setStatus("cancel");
          }
          return;
        }
      }
      store.commit("rws/setUsers", dataDevices);
      setStatus("ok");
    };

    const saveHapass = async (passToSave, setStatus) => {
      if (!isConnected.value) {
        setStatus("error", "Parachain is not ready.");
        return;
      }
      const userAddress = store.state.robonomicsUIvue.rws.user.account;

      const userType =
        store.state.robonomicsUIvue.rws.user.acctype ?? "ed25519";
      console.log("userType", userType);

      setFromPair(store.state.robonomicsUIvue.rws.user.key);
      const user = encryptor();

      try {
        encodeAddress(userAddress);
      } catch (error) {
        setStatus("error", error.message);
        return;
      }

      const encodedDevices = dataDevices.value.map((item) =>
        encodeAddress(item)
      );
      if (!encodedDevices.includes(encodeAddress(userAddress))) {
        setStatus("error", "User not found in subscription");
        return;
      }

      const setup = store.state.robonomicsUIvue.rws.list.find(
        (item) => item.owner === setupOwner.value
      );

      const passwordForAdmin = user.encryptMessage(
        passToSave,
        decodeAddress(setup.controller.address)
      );

      const passwordForRecovery = user.encryptMessage(
        passToSave,
        decodeAddress(userAddress)
      );

      setSubscription(setup.owner);
      await tx.send(
        actionDatalog.write(
          JSON.stringify({
            subscription: setup.owner,
            ha: setup.controller.address,
            admin: u8aToHex(passwordForAdmin),
            user: u8aToHex(passwordForRecovery)
          })
        )
      );

      try {
        const accountOld = store.state.robonomicsUIvue.polkadot.accounts.find(
          (item) =>
            item.address === store.state.robonomicsUIvue.polkadot.address
        );
        if (accountOld) {
          setSender(
            accountOld.address,
            store.state.robonomicsUIvue.polkadot.extensionObj.signer,
            accountOld.type
          );
        }
      } catch (e) {
        console.error(e);
      }

      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          setStatus("error", tx.error.value);
        } else {
          setStatus("cancel");
        }
        return;
      }

      setStatus("ok");
    };

    return {
      saveHapass,
      addUser,
      editController,
      removeUser
    };
  }
};
</script>
