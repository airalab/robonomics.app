<template>
  <Page>
    <RCard class="section-centered">
      <h2>Datalog</h2>
      <template v-if="robonomics">
        <ActivateForm ref="form" @onSubmit="handleSubmit" :address="address" />
        <br />
        <RButton
          size="big"
          fullWidth
          @click="$refs.form.submit()"
          :disabled="proccess"
          style="margin-bottom: 25px"
        >
          <div class="loader-ring" v-if="proccess"></div>
          &nbsp; Get log
        </RButton>
        <template v-if="count > 0">
          Count all: {{ count }}
          <h4>Last tx</h4>
          <ul>
            <li v-for="(item, k) in last" :key="k">
              <a :href="`https://ipfs.io/ipfs/${item[1]}`" target="_blank">{{
                item[1]
              }}</a>
            </li>
          </ul>
        </template>
      </template>
      <template v-else>
        <div v-if="error" class="red">{{ error }}</div>
        <div v-else>...</div>
      </template>
    </RCard>
  </Page>
</template>

<script>
import Page from "@/components/layout/Page";
import ActivateForm from "./ActivateForm";
import { Robonomics } from "@/utils/robonomics-substrate";
import { createInstance } from "@/utils/substrate";

export default {
  components: {
    Page,
    ActivateForm
  },
  data() {
    return {
      last: [],
      count: 0,
      proccess: false,
      robonomics: null,
      error: null,
      address: null
    };
  },
  async created() {
    try {
      this.robonomics = Robonomics.getInstance();
    } catch (_) {
      try {
        this.robonomics = await createInstance();
      } catch (error) {
        this.error = error.message;
      }
    }
    if (this.robonomics) {
      const accounts = this.robonomics.accountManager.getAccounts();
      this.address = accounts[0]?.address;
    }
  },
  methods: {
    async handleSubmit({ error, fields }) {
      this.proccess = true;
      if (!error) {
        this.last = [];
        const rows = await this.robonomics.datalog.read(fields.account.value);
        this.count = rows.length;
        rows.forEach((row) => {
          this.last.push([row[0].toNumber(), row[1].toHuman()]);
        });
      }
      this.proccess = false;
    }
  }
};
</script>
