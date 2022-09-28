<template>
  <robo-card>
    <robo-card-label>
      <robo-card-label-section>
        Your subscription statistics
      </robo-card-label-section>
    </robo-card-label>

    <robo-card-section>
      <robo-details summaryIcon="user" summaryText="Adresses added: 2" tooltip>
        How many address you have added to subscription.
        <robo-link router="/">Manage it</robo-link>
      </robo-details>
    </robo-card-section>

    <robo-card-section>
      <robo-details
        summaryIcon="floppy-disk"
        summaryText="Datalog tx: 2330"
        tooltip
      >
        How many transactions you used for Datalog service within subscription.
        <robo-link router="/">Watch datalog</robo-link>
      </robo-details>
    </robo-card-section>

    <robo-card-section>
      <robo-details
        summaryIcon="power-off"
        summaryText="Launch tx: 150"
        tooltip
      >
        How many transactions you used for Launch service within subscription.
        <robo-link router="/">Switch on/off your smart devices</robo-link>
      </robo-details>
    </robo-card-section>

    <robo-card-section>
      <robo-details
        summaryIcon="right-left"
        summaryText="Liability tx: 0"
        tooltip
      >
        How many transactions you used for Liability service.
      </robo-details>
    </robo-card-section>
  </robo-card>
</template>
