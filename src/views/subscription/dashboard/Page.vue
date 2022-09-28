<template>
  <robo-grid-item>
    <robo-card>
      <robo-card-label>
        <robo-card-label-section>Your subscription</robo-card-label-section>
        <robo-card-label-section info>
          With this subscription you can interact with smart devices and robots
          via Robonomics parachain instead of centilized cloud services and
          providers.
        </robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-grid columnsRepeat="2" offset="x0" valign="center">
          <template v-if="subscription.subscription.value">
            <!-- Есть активная подписка -->
            <manage-subscription
              v-if="subscription.isActive.value"
              :date="subscription.validUntilFormat"
            />
            <!-- Подписка просрочена -->
            <reactivate-subscription
              v-else
              :date="subscription.validUntilFormat"
            />
          </template>
          <!-- Не было и нет активной подписки -->
          <not-subscription v-else />

          <robo-image
            src="images/man-subscription.png"
            aria-hidden="true"
            max="400px"
          />
        </robo-grid>
      </robo-card-section>
    </robo-card>

    <!-- <robo-grid columnsRepeat="2" mediaMobile="transfer">
      <statistic />
      <robo-card>
        <robo-card-title size="2">For holders of parachain XRT</robo-card-title>
        <robo-section>
          Bond your XRT in Robonomics parachain and earn approx. 10% annual
          revenue.
        </robo-section>
        <robo-button
          :router="{ name: 'subscription-devices' }"
          icon-left="chart-pie"
          outlined
        >
          Stake XRT
        </robo-button>
      </robo-card>
    </robo-grid> -->
  </robo-grid-item>
</template>

<script>
import { onUnmounted } from "vue";
import { useAccount } from "@/hooks/useAccount";
import { useSubscription } from "@/hooks/useSubscription";
import NotSubscription from "./NotSubscription.vue";
import ManageSubscription from "./ManageSubscription.vue";
import ReactivateSubscription from "./ReactivateSubscription.vue";
// import Statistic from "./Statistic.vue";
import robonomics from "../../../robonomics";

export default {
  components: {
    NotSubscription,
    ManageSubscription,
    ReactivateSubscription
    // Statistic
  },
  setup() {
    const { account, unsubscribe } = useAccount();

    onUnmounted(() => {
      unsubscribe();
      if (unsubscribeBlock) {
        unsubscribeBlock();
      }
    });

    const subscription = useSubscription(account);

    let unsubscribeBlock;
    const updateBlock = async () => {
      unsubscribeBlock = await robonomics.onBlock(async () => {
        subscription.loadLedger(account.value);
      });
    };
    updateBlock();

    return {
      account,
      subscription
    };
  },
  watch: {
    subscription() {
      console.log(this.subscription);
    }
  }
};
</script>
