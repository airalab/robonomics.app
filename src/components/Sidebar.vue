<template>
  <div class="sidebar">
    <div class="sidebar-in">
      <section class="m-t-10">
        <img class="i-block" alt="dApp logo" src="assets/i/logo-dapp-text.svg">
      </section>
      <section>
        <section>
          <nav>
            <router-link to="/" active-class="active" exact>
              <span>{{ $t('net_stats') }}</span>
            </router-link>
            <router-link to="/lighthouse" active-class="active" exact>
              <span>{{ $t('lighthouse') }}</span>
            </router-link>
            <router-link to="/alembic" active-class="active" exact>
              <span>{{ $t('tokens_alembic') }}</span>
            </router-link>
          </nav>
        </section>
        <section>
          <nav>
            <a href="https://github.com/airalab" target="_blank">
              <span class="i-github align-vertical m-r-10"></span>
              <span class="align-vertical">Github</span>
            </a>
            <a href="https://www.reddit.com/r/robonomics/" target="_blank">
              <span class="i-reddit align-vertical m-r-10"></span>
              <span class="align-vertical">Reddit</span>
            </a>
            <a href="https://robonomics.network/" target="_blank">
              <span class="i-cursor align-vertical m-r-10"></span>
              <span class="align-vertical">robonomomics.network</span>
            </a>
            <a href="https://aira.life/" target="_blank">
              <span class="i-cursor align-vertical m-r-10"></span>
              <span class="align-vertical">aira.life</span>
            </a>
          </nav>
        </section>
      </section>
    </div>
    <a class="sidebar-toggle" href="#"></a>
  </div>
</template>

<script>
export default {};
</script>
