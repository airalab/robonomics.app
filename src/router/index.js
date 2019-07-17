import Vue from 'vue';
import Router from 'vue-router';
import PageAmbix from '@/components/ambix/Page';
import PageStatus from '@/components/status/Page';
import SelectLighthouse from '@/components/lighthouse/SelectLighthouse';
import Lighthouse from '@/components/lighthouse/Lighthouse';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/alembic',
      name: 'ambix',
      component: PageAmbix
    },
    {
      path: '/',
      name: 'status',
      component: PageStatus
    },
    {
      path: '/lighthouse',
      name: 'lighthouseSelect',
      component: SelectLighthouse
    },
    {
      path: '/lighthouse/:lighthouse',
      name: 'lighthouse',
      component: Lighthouse
    },
    { path: '*', redirect: '/' }
  ]
});
