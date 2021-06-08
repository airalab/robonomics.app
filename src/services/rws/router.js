import Page from "./components/Page";
import Subscribe from "./components/Subscribe";
import AccountManager from "./components/AccountManager";

export default {
  path: "/rws",
  component: Page,
  children: [
    {
      path: ":account?",
      name: "rws",
      component: Subscribe,
      props: true
    },
    {
      path: "accounts/:account/:new?",
      name: "rws-accounts",
      component: AccountManager,
      props: true
    }
  ]
};
