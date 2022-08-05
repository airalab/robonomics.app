<template>
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
      <robo-card-title>
        <robo-status type="success" textRight="1 month" />
      </robo-card-title>
      <robo-list>
        <robo-list-item>
          <robo-text weight="bold">Active till: {{ date }}</robo-text>
        </robo-list-item>
        <robo-list-item>
          <robo-text weight="bold">
            Owner:
            <robo-account-polkadot short inline />
          </robo-text>
        </robo-list-item>
      </robo-list>
      <robo-button :router="{ name: 'subscription-devices' }" icon-left="rss">
        Manage subscription
      </robo-button>
    </robo-card-section>
  </robo-card>
</template>

<script>
export default {
  props: ["date"]
};
</script>
