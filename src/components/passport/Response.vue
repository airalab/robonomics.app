<template>
  <div>
    <p>
      {{ $t("passport.agent") }}:
      <RLinkExplorer :text="sender" />
    </p>
    <p>
      {{ $t("passport.objective") }}:
      <RLinkExplorer :text="objective" type="ipfs" />
    </p>
    <p>
      {{ $t("passport.token") }}:
      <RLinkExplorer :text="token" category="token" />
    </p>
  </div>
</template>

<script>
export default {
  props: ["sender", "objective", "token"]
};
</script>
