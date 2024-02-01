import { createRouter, createWebHashHistory } from "vue-router";
import Home from "./views/Home.vue";
import PathNotFound from "./views/PathNotFound.vue";
import RwsActivate from "./views/RwsActivate.vue";
import RwsSetup from "./views/RwsSetup.vue";
import RwsSetupNew from "./views/RwsSetupNew.vue";
import Services from "./views/Services.vue";
import Telemetry from "./views/Telemetry.vue";

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
    component: RwsActivate,
    meta: {
      title: "RWS activation"
    }
  },
  {
    path: "/rws-setup",
    name: "rwsSetup",
    component: RwsSetup,
    meta: {
      title: "RWS setup"
    }
  },
  {
    path: "/rws-setup-new",
    name: "rwsSetupNew",
    component: RwsSetupNew,
    meta: {
      title: "RWS setup new"
    }
  },
  {
    path: "/telemetry",
    name: "telemetry",
    component: Telemetry,
    meta: {
      title: "Smart devices"
    }
  },
  {
    path: "/services",
    name: "services",
    component: Services,
    meta: {
      title: "Services"
    }
  },
  { path: "/:pathMatch(.*)*", component: PathNotFound }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
