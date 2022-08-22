<template>
  <robo-section>
    <robo-card>
      <robo-card-label>
        <robo-card-label-section>
          Verify your identity
        </robo-card-label-section>
        <robo-card-label-section info>
          Enter all the credits below to create or restore your password.
        </robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-section offset="x2">
          <robo-text weight="bold" size="small" offset="x05"
            >All Parachain accounts should be ED25519 type. Check
            <robo-link
              href="https://wiki.robonomics.network/docs/iot-sub-setup/#create-accounts"
              >how to create ED25519 type account</robo-link
            >.</robo-text
          >
          <robo-text weight="bold" size="small" offset="x05"
            >All accounts used here must be a Controller (control actions
            related) to avoid risks, do not keep all the funds on it!</robo-text
          >
        </robo-section>

        <robo-section offset="x2">
          <robo-section>
            <robo-card-title
              size="3"
              offset="x05"
              tooltip="Must be added to subscription by subscription owner. You will use it as login in Home Assistant."
              tooltipIcon="circle-question"
            >
              1. Parachain account for HA user
            </robo-card-title>

            <robo-account-polkadot
              extensionAllowShift
              selectable
              short
              addressType="ed25519"
            />
            <robo-input
              label="The seed phrase to encrypt data"
              tip="A seed phrase is a series of 12 simple randomized words"
              v-model="uri"
              type="password"
              :disabled="
                $store.state.robonomicsUIvue.polkadot.address ? false : true
              "
            />
          </robo-section>

          <robo-section>
            <robo-card-title
              size="3"
              offset="x05"
              tooltip="Ask your administrator of local smart device system"
              tooltipIcon="circle-question"
            >
              2. Administrator Credits
            </robo-card-title>

            <robo-section offset="x05">
              <robo-account-polkadot
                :addressLocal="subscriptionOwner"
                addressLocalAllowEdit
                inputLabel="Subscription owner"
                inputTip="ED25519 type Parachain account address"
              />
            </robo-section>

            <robo-section offset="x05">
              <robo-account-polkadot
                :addressLocal="adminHA"
                addressLocalAllowEdit
                inputLabel="Subscription controller"
                inputTip="ED25519 type Parachain account address"
              />
            </robo-section>
          </robo-section>

          <robo-section>
            <robo-card-title
              size="3"
              offset="x05"
              tooltip="If you have troubles in verification process, please, ask Robonomics community in Discord or create an issue on Github"
              tooltipIcon="circle-question"
            >
              3. Verification status
            </robo-card-title>

            <robo-notification
              v-if="canRegistration"
              title="Verified"
              type="success"
            />
            <template v-else>
              <template
                v-if="
                  (uri && !validateUri) ||
                  (subscriptionOwner && !hasSubscription)
                "
              >
                <robo-notification
                  v-if="uri && !validateUri"
                  title="Wrong seed phrase"
                  type="warning"
                />
                <robo-notification
                  v-if="subscriptionOwner && !hasSubscription"
                  title="Address not added to subscription"
                  type="warning"
                />
              </template>
              <robo-notification
                v-else
                title="Not verified yet"
                type="warning"
              />
            </template>
          </robo-section>
        </robo-section>
      </robo-card-section>
    </robo-card>
  </robo-section>

  <robo-section>
    <robo-card :disabled="!canRegistration">
      <robo-card-label>
        <robo-card-label-section>
          Your Home Assistant password
        </robo-card-label-section>
        <robo-card-label-section info>
          You may create or restore your password by writing or reading datalog.
          Notice that datalog data can be encrypted only by your parachain
          account with secure seed phrase.
        </robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-tabs>
          <robo-tab label="Create">
            <robo-input
              label="Create password"
              v-model="passwordInput"
              type="password"
              required
            />
            <robo-input
              label="Repeat password"
              v-model="passwordRepeatInput"
              type="password"
              required
            />

            <robo-button
              @click="savePassword"
              :disabled="
                !canRegistration ||
                !checkPasswordsMatch ||
                !passwordForAdmin ||
                !passwordForRecovery ||
                tx.process.value
              "
            >
              Create password
            </robo-button>

            <robo-notification
              v-if="!checkPasswordsMatch"
              title="Passwords are not equal"
              type="error"
            />
          </robo-tab>

          <robo-tab label="Restore">
            <robo-table
              :columns="passwordsFields"
              :rows="passwordsItems"
              layout="fixed"
            >
              <template #row(actions)>
                <robo-section offset="x0">
                  <robo-button
                    @click="showPasswordPressedAll = !showPasswordPressedAll"
                    :iconLeft="showPasswordPressedAll ? 'eye-slash' : 'eye'"
                    clean
                    size="small"
                  >
                    <template v-if="!showPasswordPressedAll">show all</template>
                    <template v-else>hide all</template>
                  </robo-button>
                </robo-section>
              </template>

              <template #cell(actions)="{ row, i }">
                <robo-button
                  @click="recoveryPassword(i)"
                  :iconLeft="row.isShow ? 'eye-slash' : 'eye'"
                  clean
                >
                  <template v-if="!row.isShow">show</template>
                  <template v-else>hide</template>
                </robo-button>
              </template>
            </robo-table>
          </robo-tab>
        </robo-tabs>
      </robo-card-section>
    </robo-card>
  </robo-section>
</template>

<script>
import { onUnmounted, watchEffect, ref, watch } from "vue";
import { useAccount } from "@/hooks/useAccount";
import { useSend } from "@/hooks/useSend";
import robonomics from "../../robonomics";
import { Keyring } from "@polkadot/keyring";
import { u8aToString, u8aToHex, hexToU8a } from "@polkadot/util";
import {
  decodeAddress,
  encodeAddress,
  validateAddress
} from "@polkadot/util-crypto";

export default {
  setup() {
    const subscriptionOwner = ref("");
    const adminHA = ref("");
    const hasSubscription = ref(false);
    const passwordsItems = ref(null);

    const { account: sender, unsubscribe } = useAccount();
    onUnmounted(() => {
      unsubscribe();
    });

    const checkHasSubscription = async (sender, owner) => {
      try {
        validateAddress(owner);
      } catch (_) {
        hasSubscription.value = false;
        return;
      }
      const devices = await robonomics.rws.getDevices(owner);
      if (devices.includes(sender)) {
        hasSubscription.value = true;
        return;
      }
      hasSubscription.value = false;
    };

    watchEffect(() => {
      checkHasSubscription(sender.value, subscriptionOwner.value);
    });

    const findPassword = async (sender) => {
      let result = [];
      const log = await robonomics.datalog.read(sender);
      for (const item of log) {
        try {
          const json = JSON.parse(item[1].toHuman());
          if (json.admin && json.user && json.ha && json.ha === adminHA.value) {
            result.push({
              created: new Date(item[0].toNumber()).toLocaleString(),
              pass: json.user.substring(0, 5) + "...",
              encrypted: json.user,
              isShow: false,
              actions: ""
            });
          }
          // eslint-disable-next-line no-empty
        } catch (_) {}
      }
      passwordsItems.value = result;
    };

    watchEffect(() => {
      findPassword(sender.value);
    });

    watch(adminHA, () => {
      try {
        validateAddress(adminHA.value);
        findPassword(sender.value);
        // eslint-disable-next-line no-empty
      } catch (_) {}
    });

    const tx = useSend();

    return {
      sender,
      subscriptionOwner,
      adminHA,
      hasSubscription,
      passwordsItems,
      tx
    };
  },

  data() {
    return {
      uri: "",
      passwordInput: "",
      passwordRepeatInput: "",
      passwordForAdmin: "",
      passwordForRecovery: "",
      passwordsFields: [
        {
          key: "created",
          label: "Created"
        },
        {
          key: "pass",
          label: "Password"
        },
        {
          key: "actions",
          label: "Actions",
          align: "right"
        }
      ],
      showPasswordPressedAll: false
    };
  },
  computed: {
    account() {
      if (this.uri) {
        try {
          const k = new Keyring();
          return k.addFromUri(this.uri, {}, "ed25519");
        } catch (error) {
          console.log(error);
        }
      }
      return null;
    },
    validateUri() {
      if (
        this.account &&
        this.sender &&
        encodeAddress(this.sender) === encodeAddress(this.account.address)
      ) {
        return true;
      }
      return false;
    },
    canRegistration() {
      if (this.validateUri && this.hasSubscription && this.adminHA) {
        return true;
      }
      return false;
    },
    checkPasswordsMatch() {
      return this.passwordInput === this.passwordRepeatInput;
    }
  },
  watch: {
    passwordInput() {
      this.generatePasswords();
    },
    passwordRepeatInput() {
      this.generatePasswords();
    },
    showPasswordPressedAll() {
      for (const key in this.passwordsItems) {
        this.recoveryPassword(key, !this.showPasswordPressedAll);
      }
    }
  },
  methods: {
    async savePassword() {
      const call = await robonomics.datalog.write(
        JSON.stringify({
          subscription: this.subscriptionOwner,
          ha: this.adminHA,
          admin: this.passwordForAdmin,
          user: this.passwordForRecovery
        })
      );
      await this.tx.send(call, this.subscriptionOwner);
    },
    generatePasswords() {
      if (this.checkPasswordsMatch) {
        this.passwordForRecovery = this.encrypt(
          this.passwordInput,
          this.account.address
        );
        this.passwordForAdmin = this.encrypt(this.passwordInput, this.adminHA);
      } else {
        this.passwordForRecovery = "";
        this.passwordForAdmin = "";
      }
    },
    recoveryPassword(index, force = undefined) {
      if (force === undefined) {
        force = this.passwordsItems[index].isShow;
      }

      if (!force) {
        this.passwordsItems[index].pass = this.decrypt(
          this.passwordsItems[index].encrypted,
          this.account.address
        );
        this.passwordsItems[index].isShow = true;
      } else {
        this.passwordsItems[index].pass =
          this.passwordsItems[index].encrypted.substring(0, 5) + "...";
        this.passwordsItems[index].isShow = false;
      }
    },
    decrypt(hex, address) {
      const decryptMessage = this.account.decryptMessage(
        hexToU8a(hex),
        u8aToHex(decodeAddress(address))
      );
      return u8aToString(decryptMessage);
    },
    encrypt(password, address) {
      const decryptMessage = this.account.encryptMessage(
        password,
        u8aToHex(decodeAddress(address))
      );
      return u8aToHex(decryptMessage);
    }
  }
};
</script>
