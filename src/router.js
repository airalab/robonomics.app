import { createRouter, createWebHashHistory } from "vue-router";
import Home from "./views/Home.vue";
import PathNotFound from "./views/PathNotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "Dashboard"
    }
  },
  {
    path: "/rws-buy",
    name: "rwsActivate",
    component: () => import("./views/RwsActivate.vue"),
    meta: {
      title: "Buy a Subscription"
    }
  },
  {
    path: "/rws-setup",
    name: "rwsSetup",
    component: () => import("./views/RwsSetup.vue"),
    meta: {
      title: "Setup a Subscription"
    }
  },
  {
    path: "/rws-setup-new",
    name: "rwsSetupNew",
    component: () => import("./views/RwsSetupNew.vue"),
    meta: {
      title: "New Subscription setup"
    }
  },
  {
    path: "/telemetry",
    name: "telemetry",
    component: () => import("./views/telemetry/Telemetry.vue"),
    meta: {
      title: "Devices control panel"
    }
  },
  {
    path: "/altruist/:address?",
    props: true,
    name: "AltruistPage",
    component: () => import("./views/altruist/Page.vue"),
    meta: {
      title: "Altruist"
    }
  },
  {
    path: "/energy-monitor/:address?",
    props: true,
    name: "EnergytMonitorPage",
    component: () => import("./views/energyMonitor/Page.vue"),
    meta: {
      title: "Energy"
    }
  },
  {
    path: "/dtwin",
    name: "DTwinPage",
    component: () => import("./views/dtwin/Page.vue"),
    meta: {
      title: "Digital Twin"
    }
  },
  { path: "/:pathMatch(.*)*", component: PathNotFound }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
