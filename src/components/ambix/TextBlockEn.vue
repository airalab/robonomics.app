<template>
  <div>
    <h1>{{ $t("header") }}</h1>
    <RCard class="window" id="window-developletter">
      <div class="window-head">
        <span>The developers&#8217; letter</span>
        <a class="window-head-toggle" href="#">–</a>
      </div>
      <div class="window-content">
        <p>
          <b>Dear Aira tokens holder,</b>
        </p>
        <p>
          With your help, we have come all the way from the
          <a href="http://aira.life" target="_blank">Aira</a> software prototype
          to the
          <a href="http://robonomics.network" target="_blank"
            >Robonomics platform</a
          >. Two years of work, more than 50 releases in
          <a href="https://github.com/airalab" target="_blank"
            >6 repositories on GitHub</a
          >, thousands of commits of the whole group of developers. Your support
          has led to the emergence of a new technology, which further aims to
          subdue robots to the Ethereum decentralized computer. You helped it.
          Thank you!
        </p>
        <p>
          It is important to understand that this is not the end of the road,
          but only the very beginning. We have created this new technology, now
          it needs to grow and also we should train the community to use
          Robonomics.
        </p>
        <p>
          The token of the Robonomics platform is called XRT (Robonomics token).
          You have two options - go through the KYC procedure and wait for the
          Dutch auction launch, or get the XRT today in 2 steps.
        </p>
        <p>
          <b
            >What is the difference between these options for the Aira tokens
            holder:</b
          >
        </p>
        <table class="table-hover table-responsive">
          <thead>
            <tr>
              <th>Aira → Aira ID</th>
              <th>Aira → Aira ID → XRT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-th="Aira → Aira ID">
                It is always possible to transform Aira ID into XRT without the
                developers’ participation, sending the transaction to the
                alembic Aira ID → XRT
              </td>
              <td data-th="Aira → Aira ID → XRT">
                It is not possible to transfer XRT tokens back into Aira ID
              </td>
            </tr>
            <tr>
              <td data-th="Aira → Aira ID">
                According to the Dutch auction result, 1 Aira ID can turn into N
                XRT, but not less than 1:1
              </td>
              <td data-th="Aira → Aira ID → XRT">
                If you have taken both steps and got XRT, you cannot count on
                increasing the number of XRTs.
              </td>
            </tr>
            <tr>
              <td data-th="Aira → Aira ID">
                Aira ID cannot be used to become a Robonomics provider
              </td>
              <td data-th="Aira → Aira ID → XRT">
                XRT can be used to secure a quota at the Robonomics lighthouse
              </td>
            </tr>
            <tr>
              <td data-th="Aira → Aira ID">
                Aira ID cannot be used to pay the commission to the Robonomics
                providers
              </td>
              <td data-th="Aira → Aira ID → XRT">
                You can pay for transactions in the Robonomics network with XRT
                - ETH is not required
              </td>
            </tr>
            <tr>
              <td data-th="Aira → Aira ID">
                Aira ID is not planned to be used for the Robonomics DAO voting
              </td>
              <td data-th="Aira → Aira ID → XRT">
                XRT can be used to create offers in the Robonomics DAO about the
                Dutch auction launch, the change of the team, which manages the
                ENS record Robonomics.eth
              </td>
            </tr>
            <tr>
              <td data-th="Aira → Aira ID">
                Aira and Aira ID tokens will not be offered by the developers
                for dex
              </td>
              <td data-th="Aira → Aira ID → XRT">
                XRT will be offered by the developers and community to be added
                to exchanges
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </RCard>
  </div>
</template>

<script>
export default {
  mounted() {
    window.windowSlide();
  }
};
</script>
