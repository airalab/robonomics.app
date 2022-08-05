<template>
  <robo-section>
    <robo-card>
      <robo-card-label>
        <robo-card-label-section>Related services</robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-grid columnsRepeat="3" offset="x0">
          <robo-template-services-item
            :router="{ name: 'home-assistant-account' }"
            label="demo"
            picture="./images/services-ha.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              }
            ]"
            title="Home Assistant account"
          >
            Get Home Assistant account for Robonomics Parachain usage
          </robo-template-services-item>

          <robo-template-services-item
            href="https://vol4tim.github.io/account-manager/"
            label="demo"
            picture="./images/services-ha.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              }
            ]"
            title="SmartHome Telemetry"
          >
            Recieve and decrypt the telemetry from your smart home IoT devices
          </robo-template-services-item>

          <robo-template-services-item
            :router="{ name: 'lights-up' }"
            label="demo"
            picture="./images/services-lights-up.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              }
            ]"
            title="Lights up!"
          >
            Set color for smart lamp via Robonomics Subscription - Decentrilized
            IoT cloud alternative.
          </robo-template-services-item>
        </robo-grid>
      </robo-card-section>
    </robo-card>
  </robo-section>
</template>
