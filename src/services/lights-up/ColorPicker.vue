<template>
  <div style="display: flex">
    <div id="picker" style="flex: 0 1 auto; height: 120px"></div>
    <robo-input
      type="text"
      v-model="colorLightUp"
      style="
        width: 120px;
        margin-left: 10px;
        flex: 0 1 auto;
        align-self: center;
      "
    />
  </div>
</template>

<script>
import iro from "@jaames/iro";

export default {
  props: {
    modelValue: String
  },
  emits: ["update:modelValue"],
  data() {
    return {
      colorPicker: null,
      colorLightUp: this.modelValue
    };
  },
  watch: {
    colorLightUp() {
      if (this.colorPicker.color.hexString !== this.colorLightUp) {
        try {
          this.colorPicker.color.set(this.colorLightUp);
          this.colorPicker.color.value = 100;
          this.$emit("update:modelValue", this.colorPicker.color.hexString);
        } catch (error) {
          console.log(error);
        }
      }
    }
  },
  mounted() {
    this.colorPicker = new iro.ColorPicker("#picker", {
      borderWidth: 1,
      width: 120,
      height: 120,
      color: this.colorLightUp,
      layoutDirection: "horizontal",
      wheelLightness: false,
      layout: [
        {
          component: iro.ui.Wheel,
          options: {
            borderColor: "#555555"
          }
        },
        {
          component: iro.ui.Slider,
          options: {
            sliderType: "saturation",
            borderColor: "#555555"
          }
        }
        // {
        //   component: iro.ui.Slider,
        //   options: {
        //     sliderType: "value",
        //     borderColor: "#555555"
        //   }
        // }
      ]
    });
    this.colorPicker.on(["color:init", "color:change"], (color) => {
      this.colorPicker.color.value = 100;
      this.colorLightUp = color.hexString;
      this.$emit("update:modelValue", this.colorPicker.color.hexString);
    });
  },
  beforeUnmount() {
    document.querySelector(".IroColorPicker").remove();
  }
};
</script>
