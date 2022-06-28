<template>
  <robo-grid-item>
    <robo-card allowExpand>
      <robo-card-label>
        <robo-card-label-section>Lights up</robo-card-label-section>
        <robo-card-label-section info>
          Set color for smart lamp via Robonomics Subscription - Decentrilized
          IoT cloud alternative.
        </robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-grid columns="4rem 5fr">
          <div>
            <robo-icon icon="lightbulb" :color="colorLightUp" size="huge" />
          </div>

          <robo-list gap="x2" fullLine>
            <robo-list-item>
              <robo-card-title size="3">Choose an account:</robo-card-title>
              <robo-account-polkadot extensionAllowShift inline short />
            </robo-list-item>

            <robo-list-item>
              <robo-card-title size="3">Get IoT Subscription:</robo-card-title>
              <robo-text>
                Ask the
                <robo-link href="https://t.me/robonomics_free_rws_bot">
                  @robonomics_free_rws
                </robo-link>
                Telegram bot to add your account to the Workshop IoT
                Subscription
              </robo-text>
            </robo-list-item>

            <robo-list-item>
              <robo-card-title size="3">
                Choose any color you like:
              </robo-card-title>
              <robo-input inputType="color" v-model="colorLightUp" />
            </robo-list-item>

            <robo-list-item>
              <robo-card-title size="3">
                Sign and send a transaction to the Robonomics Parachain:
              </robo-card-title>
              <robo-button
                v-if="!isOnlineIpfs"
                :disabled="true"
                :loading="true"
              >
                Waiting for ipfs node
              </robo-button>
              <robo-button
                v-else
                @click="send"
                :disabled="process"
                :loading="process"
              >
                Submit a transaction
              </robo-button>
            </robo-list-item>
          </robo-list>
        </robo-grid>
      </robo-card-section>
    </robo-card>
  </robo-grid-item>
</template>

<script>
import robonomics from "../../robonomics";
import { addFile } from "../../ipfs";
import { utils } from "robonomics-interface";

export default {
  data() {
    return {
      subAdmin: "4D6GaVUbg6TXDup7gdvHWyERQDK99vyreRU2hjdwptyuQUpP",
      rwsOwner: "4F6E8k2L4dpUx5Nu1uZDrKfLQxETGG5WkgsZm8PP6EE6Qnyh",
      sender: null,
      unsubscribeAccount: null,
      colorLightUp: "#8CD517",
      error: null,
      process: false,
      isOnlineIpfs: false
    };
  },
  async created() {
    if (robonomics.accountManager.account) {
      this.sender = robonomics.accountManager.account.address;
    }
    this.unsubscribeAccount = robonomics.accountManager.onChange((account) => {
      this.sender = account.address;
    });

    const ipfs = await this.$ipfs;
    this.isOnlineIpfs = ipfs.isOnline();
  },
  unmounted() {
    if (this.unsubscribeAccount) {
      this.unsubscribeAccount();
    }
  },
  methods: {
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
          ]
        : null;
    },
    getParameter() {
      const parameter = {
        platform: "light",
        name: "turn_on",
        params: {
          entity_id: "light.0x00158d000127fd62_light",
          color: this.hexToRgb(this.colorLightUp)
        }
      };
      return JSON.stringify(parameter);
    },
    async send() {
      this.error = null;
      this.process = true;
      try {
        const msg = this.getParameter();
        const hash = await addFile("launch", msg);
        robonomics.accountManager.useSubscription(this.rwsOwner);
        console.log("sender", robonomics.accountManager.account.address);
        const tx = await robonomics.launch.send(
          this.subAdmin,
          utils.cidToHex(hash)
        );
        const resultTx = await robonomics.accountManager.signAndSend(tx);
        console.log(resultTx);
        this.process = false;
        // this.message = `Saved to block ${resultTx.blockNumber}`;
      } catch (e) {
        console.log(e);
        this.error = e.message;
        this.process = false;
      }
      robonomics.accountManager.useSubscription(false);
    }
  }
};
</script>
