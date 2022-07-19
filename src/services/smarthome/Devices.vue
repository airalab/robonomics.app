<template>
  <robo-grid-item>
    <robo-section>
      <robo-card
        back-image="images/card-back-sample.png"
        back-position="100% 100%"
        back-size="contain"
      >
        <robo-card-label>
          <robo-card-label-section>Your subscription</robo-card-label-section>
          <robo-card-label-section info>
            {{ $apptextSubscriptionInfo }}
          </robo-card-label-section>
        </robo-card-label>
        <robo-card-section>
          <robo-list>
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

    <template v-if="isActive">
      <robo-list gap="x2" fullLine>
        <robo-list-item>
          <robo-text weight="light">Home assistent account</robo-text>
          <robo-input v-model="ha" />
          <router-link
            v-if="ha"
            :to="{
              name: 'smarthome-telemetry-datalog',
              params: { address: ha }
            }"
          >
            datalog
          </router-link>
        </robo-list-item>
      </robo-list>

      <robo-section>
        <robo-card allowExpand>
          <robo-card-label>
            <robo-card-label-section>Your accounts</robo-card-label-section>
          </robo-card-label>

          <robo-card-section>
            <robo-section offset="x1">
              <table>
                <tbody>
                  <tr v-for="(device, i) in devices" :key="i">
                    <td style="width: 100%">
                      <span>
                        {{ device.address }}
                      </span>
                    </td>
                    <td>
                      <robo-button
                        v-if="device.saved"
                        @click="launch(device.address)"
                        :disabled="!ha"
                      >
                        launch
                      </robo-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </robo-section>
          </robo-card-section>
        </robo-card>
      </robo-section>
    </template>
  </robo-grid-item>
</template>

<script>
import robonomics from "../../robonomics";
import Modal from "./Modal";

export default {
  data() {
    return {
      ha: "",
      owner: null,
      subscription: null,
      devices: []
    };
  },
  computed: {
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
    isActive() {
      // if (this.subscription === null || Date.now() > this.validUntil) {
      //   return false;
      // }
      return true;
    }
  },
  created() {
    if (robonomics.accountManager.account) {
      this.owner = robonomics.accountManager.account.address;
      this.loadLadger();
      this.loadDevices();
    }
    this.unsubscribe = robonomics.accountManager.onChange((account) => {
      this.subscription = null;
      this.owner = account.address;
      this.loadLadger();
      this.loadDevices();
    });
  },
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    async loadLadger() {
      const subscription = await robonomics.rws.getLedger(this.owner);
      if (!subscription.isEmpty) {
        this.subscription = subscription.value;
      }
    },
    async loadDevices() {
      const devices = await robonomics.rws.getDevices(this.owner);
      this.devices = devices.map((item) => {
        return {
          address: item.toHuman(),
          saved: true
        };
      });
    },
    launch(sender) {
      this.$vfm.show({
        component: Modal,
        bind: {
          address: this.ha,
          sender: sender
        }
      });
    }
  }
};
</script>
