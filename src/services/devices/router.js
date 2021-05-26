import Page from "./components/Page";
import Start from "./components/start/Start";
import Create from "./components/create/Create";
import List from "./components/list/List";
// import Item from "./components/list/Item";
import Activity from "./components/activity/Main";
import Msg from "./components/msg/Main";
import Twins from "./components/twins/Main";
// import TwinsCreate from "./components/twins/Create";
// import TwinsView from "./components/twins/View";

export default {
  path: "/",
  component: Page,
  children: [
    {
      path: "",
      name: "iot-start",
      component: Start
    },
    {
      path: "/iot/create",
      name: "iot-create",
      component: Create
    },
    {
      path: "/iot/devices",
      name: "iot-devices",
      component: List
    },
    // {
    //   path: "/iot/device/:id",
    //   name: "iot-item",
    //   component: Item,
    //   props: true
    // },
    {
      path: "/iot/telemetry/:id?",
      name: "iot-activity",
      component: Activity,
      props: true
    },
    {
      path: "/iot/msg/:sensor/:block/:tx",
      name: "iot-msg",
      component: Msg,
      props: true
    },
    // {
    //   path: "/iot/twins/create",
    //   name: "iot-twins-create",
    //   component: TwinsCreate
    // },
    // {
    //   path: "/iot/twins/:account",
    //   name: "iot-twin-show",
    //   component: TwinsView,
    //   props: true
    // },
    {
      path: "/iot/twins",
      name: "iot-twins",
      component: Twins
    }
  ]
};
