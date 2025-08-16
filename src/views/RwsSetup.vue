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
import { useAccount } from "@/hooks/useAccount";
import { useDevices } from "@/hooks/useDevices";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import { u8aToHex } from "@polkadot/util";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();

    const setupOwner = computed(() => {
      return store.state.robonomicsUIvue.rws.active;
    });

    const { isReady, getInstance } = useRobonomics();
    const transaction = useSend();
    const devices = useDevices(setupOwner);
    const { account } = useAccount();

    const setUser = async (user, setStatus, { skipDuplicateCheck = false } = {}) => {
      if (!isReady.value) {
        setStatus("error", "Parachain is not ready.");
        return;
      }
      if (setupOwner.value && setupOwner.value !== account.value) {
        setStatus("error", "You do not have access to this action.");
        return;
      }
      if (devices.devices.value.includes(user)) {
        if(!skipDuplicateCheck) {
          setStatus("error", "The address is already in the subscription.");
          return;
        } else {
          setStatus("ok");
          return;
        }
      }

      const call = await getInstance().rws.setDevices([
        ...devices.devices.value.filter((addr) => addr !== user),
        user
      ]);
      const tx = transaction.createTx();
      if (devices.devices.value.includes(account.value)) {
        await transaction.send(tx, call, setupOwner.value);
      } else {
        await transaction.send(tx, call);
      }
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          setStatus("error", tx.error.value);
        } else {
          setStatus("cancel");
        }
        return;
      } else {
        await devices.loadDevices();
      }
      store.commit("rws/setUsers", devices.devices);
      setStatus("ok");
    };

    const addUser = async (user, setStatus) => {
      return setUser(user, setStatus, { skipDuplicateCheck: false });
    };

    const editController = async (user, setStatus) => {
      return setUser(user, setStatus, { skipDuplicateCheck: true });
    };

    const removeUser = async (user, setStatus) => {
      if (!isReady.value) {
        setStatus("error", "Parachain is not ready.");
        return;
      }
      if (setupOwner.value && setupOwner.value !== account.value) {
        setStatus("error", "You do not have access to this action.");
        return;
      }
      if (devices.devices.value.includes(user)) {
        const call = await getInstance().rws.setDevices(
          devices.devices.value.filter((item) => item !== user)
        );
        const tx = transaction.createTx();
        if (devices.devices.value.includes(account.value)) {
          await transaction.send(tx, call, setupOwner.value);
        } else {
          await transaction.send(tx, call);
        }
        if (tx.error.value) {
          if (tx.error.value !== "Cancelled") {
            setStatus("error", tx.error.value);
          } else {
            setStatus("cancel");
          }
          return;
        } else {
          await devices.loadDevices();
        }
      }
      store.commit("rws/setUsers", devices.devices);
      setStatus("ok");
    };

    const saveHapass = async (passToSave, setStatus) => {
      if (!isReady.value) {
        setStatus("error", "Parachain is not ready.");
        return;
      }
      const userAddress = store.state.robonomicsUIvue.rws.user.account;
      const userType = store.state.robonomicsUIvue.rws.user.acctype ?? 'ed25519';
      console.log('userType', userType);

      const robonomics = getInstance();

      await robonomics.accountManager.addPair(
        store.state.robonomicsUIvue.rws.user.key
      );
      const user = robonomics.accountManager.encryptor();

      try {
        encodeAddress(userAddress);
      } catch (error) {
        setStatus("error", error.message);
        return;
      }

      const encodedDevices = devices.devices.value.map((item) =>
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
        decodeAddress(setup.controller)
      );

      const passwordForRecovery = user.encryptMessage(
        passToSave,
        decodeAddress(userAddress)
      );

      const call = await robonomics.datalog.write(
        JSON.stringify({
          subscription: setup.owner,
          ha: setup.controller.address,
          admin: u8aToHex(passwordForAdmin),
          user: u8aToHex(passwordForRecovery)
        })
      );
      const tx = transaction.createTx();
      await transaction.send(tx, call, setup.owner);

      try {
        const accountOld = store.state.robonomicsUIvue.polkadot.accounts.find(
          (item) => item.address === store.state.robonomicsUIvue.polkadot.address
        );
      
      if (accountOld) {
        await robonomics.accountManager.setSender(accountOld.address, {
          type: accountOld.type,
          extension: store.state.robonomicsUIvue.polkadot.extensionObj
        });
      }
      } catch (e) { console.error(e); }

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
