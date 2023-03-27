<template>
  <robo-grid-item>
    <robo-card allowExpand>
      <robo-card-label>
        <robo-card-label-section>Services</robo-card-label-section>
        <robo-card-label-section info>
          Robonomics contains a complete set of tools for developing IoT
          applications, both on the robotics and the user interface sides.
          Communication between the user and device happens using the most
          successful technologies from the Web3 world – IPFS, Ethereum, and
          Polkadot. Thus, developers can create modern and secure applications
          for Smart Cities and Industry 4.0.
          <robo-link href="https://robonomics.network/">Learn more</robo-link>
        </robo-card-label-section>
      </robo-card-label>

      <robo-card-section>
        <robo-grid columnsRepeat="3" offset="x0" mediaMobile="transfer">
          <robo-template-services-item
            :router="{ name: 'smarthome-telemetry' }"
            label="academy"
            picture="./images/services-telemetry.jpg"
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
            href="/#/lights-up"
            label="academy"
            picture="./images/services-lights-up.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              }
            ]"
            title="Lights Up"
          >
            Set the colour of your smart lamp with your Robonomics Subscription
            - a Decentralized IoT cloud alternative.
          </robo-template-services-item>

          <robo-template-services-item
            :router="{ name: 'home-assistant-account' }"
            picture="./images/services-ha.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              }
            ]"
            title="HomeAssistant Account"
          >
            Register a HomeAssistant account and start using the Robonomics
            Parachain with your IoT devices.
          </robo-template-services-item>

          <robo-template-services-item
            href="https://sensors.robonomics.network/#/"
            picture="./images/services-sensors.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              },
              {
                name: 'Airalab Rus',
                link: 'https://airalab.org/en/'
              }
            ]"
            title="Decentralized Sensor Map"
          >
            The Sensors Robonomics Network is a civilian network of sensors to
            monitor air quality. Anyone can build their own sensor or use an
            off-the-shelf solution from the development team and set it up in
            their home.
          </robo-template-services-item>

          <robo-template-services-item
            href="https://dapp.spot-sdk.education/#/"
            picture="./images/services-spot.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              },
              {
                name: 'Merklebot',
                link: 'https://merklebot.com'
              }
            ]"
            title="Boston Dynamics Spot SDK lessons"
          >
            Learn and practice with the Boston Dynamics Spot robot wherever you
            are. After each lesson you will receive a captured video of the
            robot movements and a printable PDF certificate.
          </robo-template-services-item>

          <robo-template-services-item
            href="https://telescope.merklebot.com/#/"
            picture="./images/services-telescope.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              },
              {
                name: 'Merklebot',
                link: 'https://merklebot.com'
              }
            ]"
            title="An Autonomous Telescope Minting RMRK NFT's"
          >
            Connect to an autonomous telescope in the dark night of the Atacama
            desert in Chile to capture an astronomical object and mint unique
            NFTs in a few clicks.
          </robo-template-services-item>

          <robo-template-services-item
            href="https://dapp.ipci.io/#/offsetting"
            picture="./images/services-offsetting.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              },
              {
                name: 'DAO IPCI',
                link: 'https://ipci.io/'
              },
              {
                name: 'Evercity',
                link: 'https://www.evercity.io/'
              }
            ]"
            title="Smart Building Offsetting"
          >
            Carbon footprint clearance for smart buildings based on geolocation
            and energy consumption information.
          </robo-template-services-item>
        </robo-grid>
      </robo-card-section>
    </robo-card>
  </robo-grid-item>
</template>
