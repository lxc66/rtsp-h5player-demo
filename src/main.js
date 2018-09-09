import Vue from 'vue';
import iView from 'iview';
import { router } from './router/index';
import { appRouter } from './router/router';
import store from './store';
import App from './app.vue';
import 'iview/dist/styles/iview.css';
import axios from 'axios';
import qs from 'qs';
import Cookies from 'js-cookie';
import util from './libs/util'




axios.defaults.baseURL = util.baseUrl
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
axios.defaults.withCredentials = true

//请求拦截器
axios.interceptors.request.use(config => {

  if (config.method === 'get' && config.params && !config.params.no_login) {
    return config;
  }

  //在请求发出之前进行一些操作
  if (config.method === 'post') {
    // POST传参序列化(添加请求拦截器)
    config.data = qs.stringify(config.data)
  }
  return config;
}, err => {
  //Do something with request error
  return Promise.reject(err);
});

//响应拦截器即异常处理
axios.interceptors.response.use(resp => {
  return resp;
}, err => {
  // if (err && err.response) {
  //   switch (err.response.status) {
  //     case 400:
  //       err.message = '错误请求'
  //       break;
  //     case 401:
  //       err.message = '未授权，请重新登录';
  //       iView.Modal.warning({
  //         title: "会话过期",
  //         content: `<span style="font-size: 14px;font-weight: bold;">` + err.response.data.message + `,即将跳转至登陆页</span><br><br>`,
  //         onOk: () => {
  //           router.push('/login');
  //         }
  //       });

  //       break;
  //     case 403:
  //       err.message = '拒绝访问'
  //       break;
  //     case 404:
  //       err.message = '请求错误,未找到该资源'
  //       router.push({
  //         name: 'error-404'
  //       });
  //       break;
  //     case 405:
  //       err.message = '请求方法未允许'
  //       break;
  //     case 408:
  //       err.message = '请求超时'
  //       break;
  //     case 500:
  //       err.message = '服务器端出错'
  //       router.push({
  //         name: 'error-500'
  //       });
  //       break;
  //     case 501:
  //       err.message = '网络未实现'
  //       break;
  //     case 502:
  //       err.message = '网络错误'
  //       break;
  //     case 503:
  //       err.message = '服务不可用'
  //       break;
  //     case 504:
  //       err.message = '网络超时'
  //       break;
  //     case 505:
  //       err.message = 'http版本不支持该请求'
  //       break;
  //     default:
  //       err.message = `连接错误${err.response.status}`
  //   }
  // } else {
  //   err.message = "连接到服务器失败"
  // }
  // iView.Message.error(err.message );
  // console.info("error msg:", err.message)
  // return Promise.resolve(err.response)
})


Vue.prototype.$axios = axios;
Vue.use(iView);

new Vue({
  el: '#app',
  router: router,
  store: store,
  render: h => h(App),
  mounted() {
    this.$store.commit('setOpenedList');
    this.$store.commit('updateMenulist');
  },
  created() {
    let tagsList = [];
    appRouter.map((item) => {
      if (item.children.length <= 1) {
        tagsList.push(item.children[0]);
      } else {
        tagsList.push(...item.children);
      }
    });
    this.$store.commit('setTagsList', tagsList);
  }
});
