<template>
  <form>
    <h3>Send message to the Robonomics.network</h3>
    <RFieldItem>
      <label for="inputdata-model">
        <span>The program's model</span>
        <a
          class="js-tooltip m-l-10"
          href="javascript:;"
          data-tooltip="'The CPSs behavioral model, or program, which takes into account the technical and economic parameters of its communication' - from Robonomics White Paper, 4 Liability of the machine"
        >
          <i class="i-info"></i>
        </a>
        <span v-if="fields.model.error" class="input-msg">Check if data correct, please.</span>
      </label>
      <RInputText
        v-model="fields.model.value"
        :isError="fields.model.error"
        placeholder="Hash from IPFS"
      />
    </RFieldItem>
    <RField label="Robot ID" :isError="fields.objective.error">
      <RInputText
        v-model="fields.objective.value"
        :isError="fields.objective.error"
        placeholder="Hash from IPFS"
      />
    </RField>
    <div class="form-item" id="moreopts" style="display:none">
      <RField label="Token" :isError="fields.token.error">
        <RInputText v-model="fields.token.value" :isError="fields.token.error" />
      </RField>
      <RField label="Cost" :isError="fields.cost.error">
        <RInputText v-model="fields.cost.value" :isError="fields.cost.error" />
      </RField>
    </div>
    <div class="form-item form-line-label">
      <a
        class="a-dashed"
        href="javascript:;"
        onclick="show(this, '#moreopts', 'Minimize', 'More options');return false;"
      >More options</a>
    </div>
  </form>
</template>

<script>
import { mixins } from "../../RComponents";

export default {
  mixins: [mixins.form],
  data() {
    return {
      fields: {
        model: {
          value: "",
          rules: ["require", "hash"],
          error: false
        },
        objective: {
          value: "",
          rules: ["require", "hash"],
          error: false
        },
        token: {
          value: "",
          rules: ["require", "address"],
          error: false
        },
        cost: {
          value: "0",
          rules: ["require", "number"],
          error: false
        }
      }
    };
  }
};
</script>
