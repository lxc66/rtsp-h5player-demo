import Vue from 'vue';
import iView from 'iview';
import Util from '../libs/util';
import VueRouter from 'vue-router';
import { routers } from './router';
import Cookies from 'js-cookie';

Vue.use(VueRouter);

// 路由配置
const RouterConfig = {
    // mode: 'history',
    routes: routers
};

export const router = new VueRouter(RouterConfig);

// router.beforeEach((to, from, next) => {
//     iView.LoadingBar.start();
//     Util.title(to.meta.title);
    
//     if (to.matched.some(record => record.meta.requiresAuth)) {
//         let token = Cookies.get("token");
//         if (token) {
//             next()
//         } else { 
//             next({
//                 path: '/login',
//                 query: { redirect: to.fullPath }
//             });
//         }
//     }else{
//     	next()
//     }



// });


// router.afterEach((to) => {
//     Util.openNewPage(router.app, to.name, to.params, to.query);
//     iView.LoadingBar.finish();
//     window.scrollTo(0, 0);
// });