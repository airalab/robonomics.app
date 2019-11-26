import validator from "../tools/validator";

const isFunction = function(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

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
        // example: {
        //   value: "",
        //   rules: [
        //     "require",
        //     "hash",
        //     validator.between(1, 3)
        //   ],
        //   error: false
        // }
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
          if (
            (isFunction(rule) && !rule(this.fields[field].value)) ||
            (validator[rule] && !validator[rule](this.fields[field].value))
          ) {
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
