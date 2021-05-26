export default {
  path: "/fuji/:lighthouse/:model/:agent",
  component: () => import("./components/Page"),
  props: true,
  children: [
    {
      path: "",
      name: "fuji"
    },
    {
      path: "token/:token/cost/:cost",
      name: "fuji-cost"
    },
    {
      path: "result/:result",
      name: "fuji-result"
    },
    {
      path: "substrate/:substrateBlock/:substrateTx",
      name: "fuji-result-substrate"
    }
  ]
};
