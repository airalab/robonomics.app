import { createRouter, createWebHashHistory } from "vue-router";
import Altruist from "./views/hardware/Altruist.vue";
import Hikikomori from "./views/hardware/Hikikomori.vue";
import Riscv from "./views/hardware/Riscv.vue";
import SeasonPass2 from "./views/hardware/Season-pass-2.vue";
import SeasonPass from "./views/hardware/Season-pass.vue";
import Smartsafe from "./views/hardware/Smart-safe.vue";
import Home from "./views/Home.vue";
import Humanoid from "./views/humanoid/RobonomicsApp.vue";
import PathNotFound from "./views/PathNotFound.vue";
import RwsActivate from "./views/RwsActivate.vue";
import RwsSetup from "./views/RwsSetup.vue";
import RwsSetupNew from "./views/RwsSetupNew.vue";
import Services from "./views/Services.vue";
import Telemetry from "./views/telemetry/Telemetry.vue";

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
      title: "Buy a Subscription"
    }
  },
  {
    path: "/rws-setup",
    name: "rwsSetup",
    component: RwsSetup,
    meta: {
      title: "Setup a Subscription"
    }
  },
  {
    path: "/rws-setup-new",
    name: "rwsSetupNew",
    component: RwsSetupNew,
    meta: {
      title: "New Subscription setup"
    }
  },
  {
    path: "/telemetry",
    name: "telemetry",
    component: Telemetry,
    meta: {
      title: "Devices control panel"
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
  {
    path: "/hardware/altruist",
    name: "Altruist",
    component: Altruist,
    meta: {
      title: "Altruist"
    }
  },
  {
    path: "/hardware/riscv",
    name: "Riscv",
    component: Riscv,
    meta: {
      title: "Riscv"
    }
  },
  {
    path: "/hardware/hikikomori",
    name: "Hikikomori",
    component: Hikikomori,
    meta: {
      title: "Hikikomori"
    }
  },
  {
    path: "/hardware/smart-safe",
    name: "Smartsafe",
    component: Smartsafe,
    meta: {
      title: "Smart Safe"
    }
  },
  {
    path: "/hardware/season-pass",
    name: "SeasonPass",
    component: SeasonPass,
    meta: {
      title: "Season Pass"
    }
  },
  {
    path: "/hardware/season-pass-2",
    name: "SeasonPass2",
    component: SeasonPass2,
    meta: {
      title: "Season Pass 2"
    }
  },
  {
    path: "/humanoid",
    name: "Humanoid",
    component: Humanoid,
    meta: {
      title: "The-Rise-of-Humanoids"
    }
  },
  { path: "/:pathMatch(.*)*", component: PathNotFound }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
