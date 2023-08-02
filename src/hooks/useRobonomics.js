import { inject, toRaw } from "vue";

export function useRobonomics() {
  const { instance } = inject("RobonomicsProvider");
  return toRaw(instance).value;
}
