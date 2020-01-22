import Vue from "vue";
import Router from "vue-router";
import Status from "@/views/Status";
import SelectLighthouse from "@/views/SelectLighthouse";
import Lighthouse from "@/views/Lighthouse";
import Ambix from "@/views/Ambix";
import Services from "@/views/Services";
import Sensors from "@/views/Sensors";
import Sensor from "@/views/Sensor";
import Passport from "@/views/Passport";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "status",
      component: Status
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
      path: "/services",
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
      path: "/sensors/:lighthouse/:model/:agent",
      component: Sensor,
      props: true,
      children: [
        {
          path: "",
          name: "sensor"
        },
        {
          path: "token/:token/cost/:cost",
          name: "sensor-cost"
        },
        {
          path: "result/:result",
          name: "sensor-result"
        }
      ]
    },
    {
      path: "/passport",
      component: Passport,
      props: true,
      children: [
        {
          path: "",
          name: "passport-registration"
        },
        {
          path: ":passport",
          name: "passport-view"
        }
      ]
    },
    { path: "*", redirect: "/" }
  ]
});
