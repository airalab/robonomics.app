import Vue from "vue";
import Router from "vue-router";
import Overview from "@/views/Overview";
import Telemetry from "@/views/Telemetry";
import SelectLighthouse from "@/views/SelectLighthouse";
import Lighthouse from "@/views/Lighthouse";
import Ambix from "@/views/Ambix";
import Services from "@/views/Services";
import Sensors from "@/views/Sensors";
import Liability from "@/views/Liability";
import Approve from "@/views/Approve";
import Results from "@/views/Results";
import Uniswap from "@/views/Uniswap";
import services from "@/services";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/overview",
      name: "overview",
      component: Overview
    },
    {
      path: "/telemetry",
      name: "telemetry",
      component: Telemetry
    },
    {
      path: "/lighthouse",
      name: "lighthouseSelect",
      component: SelectLighthouse
    },
    {
      path: "/lighthouse/:lighthouse",
      name: "lighthouse",
      component: Lighthouse
    },
    {
      path: "/alembic",
      name: "ambix",
      component: Ambix
    },
    {
      path: "/",
      name: "services",
      component: Services
    },
    {
      path: "/sensors/:lighthouse?",
      name: "sensors",
      component: Sensors,
      props: true
    },
    {
      path: "/liability/:liability",
      name: "liability",
      component: Liability,
      props: true
    },
    {
      path: "/approve",
      name: "approve",
      component: Approve
    },
    {
      path: "/results",
      name: "results",
      component: Results
    },
    {
      path: "/uniswap/:referral?",
      name: "uniswap",
      component: Uniswap,
      props: true
    },
    ...Object.values(services)
      .filter((item) => item.router)
      .map((item) => item.router),
    { path: "*", redirect: "/" }
  ]
});
