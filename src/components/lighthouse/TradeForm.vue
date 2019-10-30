<template>
  <form>
    <h3>Send message to the Robonomics.network</h3>
    <div class="form-item form-line-label">
      <label for="inputdata-model">
        <span>The program's model</span>
        <a
          class="js-tooltip m-l-10"
          href="javascript:;"
          data-tooltip="'The CPSs behavioral model, or program, which takes into account the technical and economic parameters of its communication' - from Robonomics White Paper, 4 Liability of the machine"
        >
          <i class="i-info"></i>
        </a>
      </label>
      <input
        v-model="fields.model.value"
        class="container-full"
        :class="{ error: fields.model.error }"
        type="text"
        placeholder="Hash from IPFS"
        required
      />
    </div>

    <div class="form-item">
      <div class="form-item form-line-label">
        <label for="input3">
          <span>Robot ID</span>
        </label>
        <input
          v-model="fields.objective.value"
          class="container-full"
          :class="{ error: fields.objective.error }"
          type="text"
          placeholder="Hash from IPFS"
          required
        />
      </div>
    </div>
    <div class="form-item" id="moreopts" style="display:none">
      <div class="form-item">
        <div class="form-item form-line-label">
          <label for="input3">
            <span>Token</span>
          </label>
          <input
            v-model="fields.token.value"
            class="container-full"
            :class="{ error: fields.token.error }"
            type="text"
            required
          />
        </div>
      </div>
      <div class="form-item">
        <div class="form-item form-line-label">
          <label for="input3">
            <span>Cost</span>
          </label>
          <input
            v-model="fields.cost.value"
            class="container-full"
            :class="{ error: fields.cost.error }"
            type="text"
            required
          />
        </div>
      </div>
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
import validator from "../../RComponents/tools/validator";

export default {
  props: {
    onSubmit: {
      type: Function
    },
    onChange: {
      type: Function
    }
  },
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
          value: 0,
          rules: ["require", "number"],
          error: false
        }
      },
      error: false
    };
  },
  created() {
    this.onChange(this.fields);
  },
  updated() {
    this.onChange(this.fields);
  },
  methods: {
    validate() {
      this.error = false;
      for (let field in this.fields) {
        this.fields[field].error = false;
        this.fields[field].rules.forEach(rule => {
          if (!validator[rule](this.fields[field].value)) {
            this.fields[field].error = true;
            this.error = true;
          }
        });
      }
      return !this.error;
    },
    submit() {
      this.validate();
      if (this.onSubmit) {
        this.onSubmit(this.error, this.fields);
      }
    }
  }
};
</script>
