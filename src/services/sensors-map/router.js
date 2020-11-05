import Page from "./components/Page";

export default {
  path: "/sensors-map/:provider?/:type?/:zoom?/:lat?/:lng?",
  name: "sensors-map",
  component: Page,
  props: true
};
