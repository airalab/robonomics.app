import Page from "./components/Page";
import Start from "./components/Start";
import Bid from "./components/Bid";
import DevicesManager from "./components/DevicesManager";

export default {
  path: "/rws",
  component: Page,
  children: [
    {
      path: "",
      name: "rws-start",
      component: Start
    },
    {
      path: "activation",
      name: "rws",
      component: Bid,
      props: true
    },
    {
      path: "devices/:owner",
      name: "rws-devices",
      component: DevicesManager,
      props: true
    }
  ]
};
