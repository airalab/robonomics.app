<template>
  <robo-grid-item
    media-mobile="collapse-right"
    collapse-icon="user"
    collapse-text="Account"
  >
    <robo-grid offset="x0">
      <Account />

      <Ipfs />

      <robo-card outlined>
        <robo-card-label>
          <robo-card-label-section
            ><robo-icon icon="comment"
          /></robo-card-label-section>
          <robo-card-label-section>Support</robo-card-label-section>
        </robo-card-label>

        <robo-card-section>
          <robo-text size="small" weight="bold">
            <robo-grid embed gap="x05">
              <robo-link
                href="https://github.com/airalab/dapp.robonomics.network/issues"
                >Open issue on GitHub</robo-link
              >
              <robo-link href="https://wiki.robonomics.network/"
                >Read Robonomics WIKI</robo-link
              >
              <robo-link href="https://discord.com/invite/5UWNGNaAUf"
                >Chat in Discord</robo-link
              >
            </robo-grid>
          </robo-text>
        </robo-card-section>
      </robo-card>
    </robo-grid>
  </robo-grid-item>
</template>

<script>
import Account from "./sidebar-right/Account.vue";
import Ipfs from "./sidebar-right/Ipfs.vue";

export default {
  components: {
    Account,
    Ipfs
  }
};
</script>
