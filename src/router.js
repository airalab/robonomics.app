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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
