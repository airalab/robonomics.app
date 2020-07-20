<template>
  <Page>
    <RCard class="section-centered">
      <h2>Datalog</h2>
      <ActivateForm ref="form" @onSubmit="handleSubmit" />
      <br />
      <RButton
        size="big"
        fullWidth
        @click="$refs.form.submit()"
        :disabled="proccess"
        style="margin-bottom: 25px;"
      >
        <div class="loader-ring" v-if="proccess"></div>&nbsp; Get log
      </RButton>
      <template v-if="count > 0">
        Count all: {{count}}
        <h4>Last tx</h4>
        <ul>
          <li v-for="(item, k) in last" :key="k">
            <a :href="`https://ipfs.io/ipfs/${item[1]}`" target="_blank">{{item[1]}}</a>
          </li>
        </ul>
      </template>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import ActivateForm from "./ActivateForm";
import { getInstance, toIpfsHash } from "../utils/substrate";

export default {
  components: {
    Page,
    ActivateForm
  },
  data() {
    return {
      last: [],
      count: 0,
      proccess: false
    };
  },
  methods: {
    async handleSubmit({ error, fields }) {
      this.proccess = true
      if (!error) {
        const substrate = await getInstance();
        const log = (await substrate.query.datalog.datalog(fields.account.value)).toArray();
        this.count = log.length
        this.last = log.slice(-10).map(item => {
          return [item[0], toIpfsHash(item[1])]
        })
      }
      this.proccess = false
    }
  }
};
</script>
