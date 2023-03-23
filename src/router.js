import { createRouter, createWebHashHistory } from "vue-router";
import ServiceHomeAssistantAccount from "./services/home-assistant-account/Page.vue";
import ServiceLightsUpDemo from "./services/lights-up-demo/Page.vue";
import ServiceLightsUp from "./services/lights-up/Page.vue";
import ServiceSmartHomeTelemetry from "./services/smarthome/Page.vue";
import CreateAccount from "./views/CreateAccount";
import Services from "./views/services/Page.vue";
import Bid from "./views/subscription/Bid.vue";
import Subscription from "./views/subscription/dashboard/Page.vue";
import DevicesManager from "./views/subscription/DevicesManager.vue";

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: Subscription,
    meta: {
      breadcrumbs: [
        {
          text: "Dashboard",
          active: true
        }
      ],
      title: "Dashboard",
      description: ""
    }
  },
  {
    path: "/subscription",
    name: "subscription-bid",
    component: Bid,
    meta: {
      breadcrumbs: [
        {
          text: "Subscription",
          active: true
        }
      ],
      title: "New subscription",
      description: ""
    }
  },
  {
    path: "/subscription/devices",
    name: "subscription-devices",
    component: DevicesManager,
    meta: {
      breadcrumbs: [
        {
          text: "Subscription",
          active: true
        }
      ],
      title: "Subscription",
      description: ""
    }
  },
  {
    path: "/services",
    name: "services",
    component: Services,
    meta: {
      breadcrumbs: [
        {
          text: "Services",
          active: true
        }
      ],
      title: "Services",
      description: ""
    }
  },
  {
    path: "/lights-up",
    name: "lights-up",
    component: ServiceLightsUp,
    meta: {
      breadcrumbs: [
        {
          text: "Services",
          href: "/#/services"
        },
        {
          text: "Lights up",
          active: true
        }
      ],
      title: "Lights up!",
      description:
        "Set color for smart lamp via Robonomics Subscription - Decentrilized IoT cloud alternative."
    }
  },
  {
    path: "/lights-up-demo",
    name: "lights-up-demo",
    component: ServiceLightsUpDemo,
    meta: {
      breadcrumbs: [
        {
          text: "Services",
          href: "/#/services"
        },
        {
          text: "Lights up",
          active: true
        }
      ],
      title: "Lights up!",
      description:
        "Set color for smart lamp via Robonomics Subscription - Decentrilized IoT cloud alternative."
    }
  },
  {
    path: "/home-assistant",
    name: "home-assistant-account",
    component: ServiceHomeAssistantAccount,
    meta: {
      breadcrumbs: [
        {
          text: "Services",
          href: "/#/services"
        },
        {
          text: "Home Assistant Account",
          active: true
        }
      ],
      title: "Home Assistant account",
      description: "Get Home Assistant account for Robonomics Parachain usage"
    }
  },
  {
    path: "/smarthome-telemetry",
    name: "smarthome-telemetry",
    component: ServiceSmartHomeTelemetry,
    meta: {
      breadcrumbs: [
        {
          text: "Services",
          href: "/#/services"
        },
        {
          text: "SmartHome Telemetry",
          active: true
        }
      ],
      title: "SmartHome Telemetry",
      description:
        "Recieve and decrypt the telemetry from your smart home IoT devices"
    }
  },
  {
    path: "/create-account",
    name: "create-account",
    component: CreateAccount,
    meta: {
      breadcrumbs: [
        {
          text: "Generate account",
          active: true
        }
      ],
      title: "Generate account",
      description: "Generate account"
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
