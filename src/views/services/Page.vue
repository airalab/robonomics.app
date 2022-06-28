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
        <robo-grid columnsRepeat="3" offset="x0">
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

          <!-- <robo-template-services-item
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
          </robo-template-services-item> -->

          <robo-template-services-item
            href="https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama.rpc.robonomics.network%2F#/explorer"
            picture="./images/services-kusama-parachain.jpg"
            :providers="[
              {
                name: 'Robonomics Core Team',
                link: 'https://robonomics.network'
              }
            ]"
            title="Robonomics Kusama Parachain"
          >
            Robonomics won parachain slot in Kusama. Kusama parachain is great
            opportunity for Robonomics to scale network up to 1 million IoT
            systems connected in real-time without any centrilized regulators.
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
            title="Decentralized sensors map"
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
            are. Get after each lesson captured video, robot movements recorded
            and printable PDF certificate.
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
            title="The autonomous telescope mints NFT"
          >
            Connect to the autonomous telescope in the dark night of Atacama
            desert in Chile, select an astronomical object and mint unique NFTs
            in a few clicks.
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
            title="The autonomous telescope mints NFT"
          >
            Carbon footprint clearance for smart buildings based on geolocation
            and energy consumption information.
          </robo-template-services-item>
        </robo-grid>
      </robo-card-section>
    </robo-card>
  </robo-grid-item>
</template>
