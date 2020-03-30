import Page from "./components/Page";

export default {
  path: "/blockchain-stamp",
  component: Page,
  props: true,
  children: [
    {
      path: "",
      name: "blockchain-stamp"
    },
    {
      path: ":passport",
      name: "passport-view"
    }
  ]
};
