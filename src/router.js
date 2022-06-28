import { createRouter, createWebHashHistory } from "vue-router";
import Subscription from "./views/subscription/Page.vue";
import Bid from "./views/subscription/Bid.vue";
import DevicesManager from "./views/subscription/DevicesManager.vue";
import Services from "./views/services/Page.vue";
import ServiceLightsUp from "./services/lights-up/Page.vue";
import ServiceHomeAssistantAccount from "./services/home-assistant-account/Page.vue";

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
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
