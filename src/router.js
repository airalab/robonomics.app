import { createRouter, createWebHashHistory } from "vue-router";
import Home from "./views/Home.vue";
import RwsActivate from "./views/RwsActivate.vue";
import RwsSetup from "./views/RwsSetup.vue";
import RwsSetupsList from "./views/RwsSetupsList.vue";
import RwsUserSetup from "./views/RwsUserSetup.vue";
import RwsUsersList from "./views/RwsUsersList.vue";
import Services from "./views/Services.vue";
import Telemetry from "./views/Telemetry.vue";
import HaSetup from "./views/haSetup/Page.vue";

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
    path: "/rws-activate",
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
    path: "/rws-setups-list",
    name: "rwsSetupsList",
    component: RwsSetupsList,
    meta: {
      title: "Your RWS setups"
    }
  },
  {
    path: "/rws-user-setup",
    name: "rwsUserSetup",
    component: RwsUserSetup,
    meta: {
      title: "RWS add user"
    }
  },
  {
    path: "/rws-users-list",
    name: "rwsUsersList",
    component: RwsUsersList,
    meta: {
      title: "Users in your RWS"
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
    path: "/hasetup",
    name: "haSetup",
    component: HaSetup,
    meta: {
      title: "HA setup"
    }
  },
  {
    path: "/services",
    name: "services",
    component: Services,
    meta: {
      title: "Services"
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
