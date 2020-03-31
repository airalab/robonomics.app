export default {
  path: "/sensors/:lighthouse/:model/:agent",
  component: () => import("./components/Page"),
  props: true,
  children: [
    {
      path: "",
      name: "sensor"
    },
    {
      path: "token/:token/cost/:cost",
      name: "sensor-cost"
    },
    {
      path: "result/:result",
      name: "sensor-result"
    },
    {
      path: "substrate/:substrateBlock/:substrateTx",
      name: "sensor-result-substrate"
    }
  ]
};
