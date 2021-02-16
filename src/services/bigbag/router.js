import Page from "./components/Page";
import Grant from "./components/Grant";

export default [
  {
    path: "/bigbag",
    name: "bigbag",
    component: Page
  },
  {
    path: "/vesting-grants",
    name: "grant",
    component: Grant
  }
];
