<template>
  <robo-layout-section>
    <robo-template-rws-setup
      :onRwsUpdate="rwsUpdateActions"
      :onUserDelete="removeUser"
      :onUserAdd="addUser"
      :onSaveHapass="saveHapass"
    />
  </robo-layout-section>
</template>

<script>
import { useAccount } from "@/hooks/useAccount";
import { useDevices } from "@/hooks/useDevices";
import { useRobonomics } from "@/hooks/useRobonomics";
import { useSend } from "@/hooks/useSend";
import { createPair, encryptor } from "@/utils/encryptor";
import { Keyring } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { computed, watch } from "vue";
import { useStore } from "vuex";

export default {
  setup() {
    const store = useStore();

    const setupOwner = computed(() => {
      return store.state.robonomicsUIvue.rws.active;
    });

    const robonomics = useRobonomics();
    const transaction = useSend();
    const devices = useDevices(setupOwner);
    const { account } = useAccount();

    const fillStorage = () => {
      store.commit("rws/setUsers", devices.devices.value);
    };
    watch(devices.devices, fillStorage);

    const rwsUpdateActions = (rws, setStatus) => {
      if (!rws.owner || !rws.name || !rws.controller || !rws.scontroller) {
        setStatus("error", "All fields are required");
        return;
      }

      try {
        encodeAddress(rws.owner);
      } catch (error) {
        setStatus("error", `Owner: ${error.message}`);
        return;
      }
      try {
        encodeAddress(rws.controller);
      } catch (error) {
        setStatus("error", `Controller: ${error.message}`);
        return;
      }

      const k = new Keyring();
      const accountController = k.addFromUri(rws.scontroller, {}, "ed25519");

      if (encodeAddress(rws.controller) !== accountController.address) {
        setStatus("error", "Bad seed or type not ed25519");
        return;
      }

      setStatus("ok");
    };

    const addUser = async (user, setStatus) => {
      if (setupOwner.value && setupOwner.value !== account.value) {
        setStatus("error", "You do not have access to this action.");
        return;
      }

      if (!devices.devices.value.includes(user)) {
        const call = await robonomics.rws.setDevices([
          ...devices.devices.value,
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
      }
      setStatus("ok");
    };

    const removeUser = async (user, setStatus) => {
      if (setupOwner.value && setupOwner.value !== account.value) {
        setStatus("error", "You do not have access to this action.");
        return;
      }
      if (devices.devices.value.includes(user)) {
        const call = await robonomics.rws.setDevices(
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
      setStatus("ok");
    };

    const saveHapass = async (userAddress, userSeed, passToSave, setStatus) => {
      if (!userAddress || !userSeed || !passToSave) {
        setStatus("error", "All fields are required");
        return;
      }

      try {
        encodeAddress(userAddress);
      } catch (error) {
        setStatus("error", error.message);
        return;
      }

      const k = new Keyring();
      const accountUser = k.addFromUri(userSeed, {}, "ed25519");

      if (encodeAddress(userAddress) !== accountUser.address) {
        setStatus("error", "Bad seed or type not ed25519");
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

      const user = encryptor(createPair(userSeed));

      const passwordForAdmin = user.encryptMessage(
        passToSave,
        decodeAddress(setup.controller)
      );

      const passwordForRecovery = user.encryptMessage(
        passToSave,
        decodeAddress(userAddress)
      );

      robonomics.accountManager.account = accountUser;

      const call = await robonomics.datalog.write(
        JSON.stringify({
          subscription: setup.owner,
          ha: setup.controller,
          admin: u8aToHex(passwordForAdmin),
          user: u8aToHex(passwordForRecovery)
        })
      );
      const tx = transaction.createTx();
      await transaction.send(tx, call, setup.owner);
      if (tx.error.value) {
        if (tx.error.value !== "Cancelled") {
          setStatus("error", tx.error.value);
        } else {
          setStatus("cancel");
          return;
        }
      }

      const accountOld = store.state.robonomicsUIvue.polkadot.accounts.find(
        (item) => item.address === store.state.robonomicsUIvue.polkadot.address
      );
      await robonomics.accountManager.setSender(accountOld.address, {
        type: accountOld.type,
        extension: store.state.robonomicsUIvue.polkadot.extensionObj
      });

      setStatus("ok");
    };

    return {
      saveHapass,
      rwsUpdateActions,
      addUser,
      removeUser
    };
  }
};
</script>
