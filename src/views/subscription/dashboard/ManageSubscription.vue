<template>
  <div>
    <robo-card-title>
      <robo-status type="success" textRight="1 month" />
    </robo-card-title>

    <robo-section>
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
    </robo-section>

    <robo-button
      :router="{ name: 'subscription-devices' }"
      icon-left="rss"
      type="ok"
    >
      Manage subscription
    </robo-button>
  </div>
</template>

<script>
export default {
  props: ["date"]
};
</script>
