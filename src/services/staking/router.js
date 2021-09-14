import Page from "./components/Page";
import Info from "./components/Info";

export default {
  path: "/staking",
  component: Page,
  children: [
    {
      path: "",
      name: "staking",
      component: Info
    }
  ]
};
