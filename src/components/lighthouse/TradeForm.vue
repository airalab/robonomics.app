<template>
  <form v-on:submit.prevent="submit">
    <h3>{{ $t("lighthouse.trade.title") }}</h3>

    <RFormField>
      <label for="inputdata-model">
        <span>{{ $t("lighthouse.trade.title") }}</span>
        <a
          class="js-tooltip m-l-10"
          href="javascript:;"
          data-tooltip="'The CPSs behavioral model, or program, which takes into account the technical and economic parameters of its communication' - from Robonomics White Paper, 4 Liability of the machine"
        >
          <i class="i-info"></i>
        </a>
        <span v-if="fields.model.error" class="input-msg">
          {{
          $t("lighthouse.trade.correct")
          }}
        </span>
      </label>
      <input
        type="text"
        v-model="fields.model.value"
        class="container-full"
        :class="{ error: fields.model.error }"
        placeholder="Hash from IPFS"
      />
    </RFormField>
    <RFormField>
      <RFieldLabel :isError="fields.objective.error">Robot ID</RFieldLabel>
      <input
        type="text"
        v-model="fields.objective.value"
        class="container-full"
        :class="{ error: fields.objective.error }"
        placeholder="Hash from IPFS"
      />
    </RFormField>

    <div class="form-item" id="moreopts" style="display:none">
      <RFormField>
        <RFieldLabel :isError="fields.token.error">Token</RFieldLabel>
        <input
          type="text"
          v-model="fields.token.value"
          class="container-full"
          :class="{ error: fields.token.error }"
        />
      </RFormField>
      <RFormField>
        <RFieldLabel :isError="fields.cost.error">Cost</RFieldLabel>
        <input
          type="text"
          v-model="fields.cost.value"
          class="container-full"
          :class="{ error: fields.cost.error }"
        />
      </RFormField>
    </div>
    <div class="form-item form-line-label">
      <a
        class="a-dashed"
        href="javascript:;"
        onclick="show(this, '#moreopts', 'Minimize', 'More options');return false;"
      >{{ $t("lighthouse.trade.more") }}</a>
    </div>
  </form>
</template>

<script>
import robonomicsVC from "robonomics-vc";

export default {
  mixins: [robonomicsVC.mixins.form],
  data() {
    return {
      fields: {
        model: {
          value: "",
          rules: ["require", "hashIpfs"],
          error: false
        },
        objective: {
          value: "",
          rules: ["require", "hashIpfs"],
          error: false
        },
        token: {
          value: "",
          rules: ["require", robonomicsVC.validators.length(42)],
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
