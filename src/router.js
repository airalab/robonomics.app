import Vue from 'vue';
import Router from 'vue-router';
import Status from '@/views/Status';
import SelectLighthouse from '@/views/SelectLighthouse';
import Lighthouse from '@/views/Lighthouse';
import Ambix from '@/views/Ambix';
import Services from '@/views/Services';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'status',
      component: Status
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
    {
      path: '/alembic',
      name: 'ambix',
      component: Ambix
    },
    {
      path: '/services',
      name: 'services',
      component: Services
    },
    { path: '*', redirect: '/' }
  ]
});
