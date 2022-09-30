<template>
  <robo-section>
    <robo-details block open :contentCloseOutOfFocus="false">
      <template #summary>
        <robo-section
          backColor="rgb(16, 118, 249)"
          textColor="#ffffff"
          offset="x0"
        >
          <robo-card-title size="2" offset="x0">
            Stake your Parachain XRT and get rewards
          </robo-card-title>
        </robo-section>
      </template>

      <robo-section
        backColor="rgb(0, 159, 253)"
        textColor="#ffffff"
        offset="x1"
      >
        <robo-text weight="normal-italic" offset="x1" hyphen>
          During 1st year of Kusama Slot lease by Robonomics it is allowed to
          stake XRT for token holders. These tokens take part in a pool of
          <robo-link :router="{ name: 'subscription-bid' }"
            >IoT subscriptions</robo-link
          >.
        </robo-text>
        <robo-text weight="bold-italic" offset="x0" hyphen>
          Rewards Distribution = 40Wn * XRT / block
        </robo-text>
        <robo-text weight="bold-italic" offset="x0" hyphen>
          Increased Rewards Distribution = 200Wn * XRT / block
        </robo-text>
        <robo-text weight="normal-italic" offset="x1" hyphen>
          1Wn = 1 XRT * 10-9
        </robo-text>
      </robo-section>
    </robo-details>
  </robo-section>
</template>
