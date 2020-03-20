<template>
  <Page>
    <SelectLighthouse
      @connect="(lighthouse) => {
        $router.push({ path: `/lighthouse/${lighthouse}` });
      }"
    />
  </Page>
</template>

<script>
import Page from "../components/Page";
import SelectLighthouse from "../components/lighthouse/SelectLighthouse";

export default {
  components: {
    Page,
    SelectLighthouse
  }
};
</script>
