import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录',
        requiresAuth: false
    },
    component: resolve => {
        require(['@/views/login.vue'], resolve);
    }
};

export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-页面不存在',
        requiresAuth: false
    },
    component: resolve => {
        require(['@/views/error-page/404.vue'], resolve);
    }
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足',
        requiresAuth: false
    },
    name: 'error-403',
    component: resolve => {
        require(['@//views/error-page/403.vue'], resolve);
    }
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误',
        requiresAuth: false
    },
    name: 'error-500',
    component: resolve => {
        require(['@/views/error-page/500.vue'], resolve);
    }
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [{
        path: 'home',
        title: '首页',
        name: 'home',
        component: resolve => {
            require(['@/views/home/home.vue'], resolve);
        },
        // meta: {
        //     requiresAuth: true
        // }
    }]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [{
        path: '/device',
        icon: 'social-instagram',
        name: 'device',
        title: 'h5播放器',
        component: Main,
        children: [
            {
                path: 'wsplayerC',
                icon: 'ios-list-outline',
                name: 'wsplayerC',
                title: 'h5播放C',
                component: resolve => {
                    require(['@/views/video/videoh5C.vue'], resolve);
                },
            },
            {
                path: 'wsplayerU',
                icon: 'ios-list-outline',
                name: 'wsplayerU',
                title: 'h5播放U',
                component: resolve => {
                    require(['@/views/video/videoh5U.vue'], resolve);
                },
            },
            {
                path: 'wsplayerN',
                icon: 'ios-list-outline',
                name: 'wsplayerN',
                title: 'h5播放N',
                component: resolve => {
                    require(['@/views/video/videoh5N.vue'], resolve);
                },
            }
        ]
    }
            // {
            //     path: 'devList',
            //     icon: 'ios-list-outline',
            //     name: 'devList',
            //     title: '使用中设备',
            //     component: resolve => {
            //         require(['@/views/device/devList.vue'], resolve);
            //     },
            //     meta: {
            //         requiresAuth: true
            //     }
            // },
    //         {
    //             path: 'order',
    //             icon: 'clipboard',
    //             name: 'order',
    //             title: '充值记录',
    //             component: resolve => {
    //                 require(['@/views/device/order.vue'], resolve);
    //             },
    //             meta: {
    //                 requiresAuth: true
    //             }
    //         },
    //         {
    //             path: 'deviceStock',
    //             icon: 'clipboard',
    //             name: 'deviceStock',
    //             title: '设备列表',
    //             component: resolve => {
    //                 require(['@/views/device/deviceStock.vue'], resolve);
    //             },
    //             meta: {
    //                 requiresAuth: true
    //             }
    //         },

    //     ]
    // },
    // {
    //     path: '/product',
    //     icon: 'ios-barcode',
    //     name: 'product',
    //     title: '套餐管理',
    //     component: Main,
    //     children: [{
    //         path: 'productList',
    //         icon: 'ios-list-outline',
    //         name: 'productList',
    //         title: '套餐列表',
    //         component: resolve => {
    //             require(['@/views/product/productList.vue'], resolve);
    //         },
    //         meta: {
    //             requiresAuth: true
    //         }
    //     }]
    // },
    // {
    //     path: '/userList',
    //     icon: 'ios-people',
    //     name: 'userList',
    //     title: '用户管理',
    //     component: Main,
    //     children: [{
    //         path: 'index',
    //         title: '用户管理',
    //         name: 'userList_index',
    //         component: resolve => {
    //             require(['@/views/user/userList.vue'], resolve)
    //         },
    //         meta: {
    //             requiresAuth: true
    //         }
    //     }],
    // },
    // {
    //     path: '/dict',
    //     icon: 'ios-people',
    //     name: 'dict',
    //     title: '参数管理',
    //     component: Main,
    //     children: [{
    //         path: 'index',
    //         title: '参数管理',
    //         name: 'dict_index',
    //         component: resolve => {
    //             require(['@/views/dict/dict.vue'], resolve)
    //         },
    //         meta: {
    //             requiresAuth: true
    //         }
    //     }],
    // },
    // {
    //     path: '/agentList',
    //     icon: 'android-people',
    //     name: 'agentList',
    //     title: '代理商管理',
    //     component: Main,
    //     children: [{
    //         path: 'index',
    //         title: '代理商管理',
    //         name: 'agentList_index',
    //         component: resolve => {
    //             require(['@/views/user/agentList.vue'], resolve)
    //         },
    //         meta: {
    //             requiresAuth: true
    //         }
    //     }]
    // },
    // {
    //     path: '/amdin',
    //     icon: 'android-contacts',
    //     name: 'admin',
    //     title: '管理员信息',
    //     component: Main,
    //     children: [{
    //             path: 'adminInformation',
    //             icon: 'android-contact',
    //             name: 'adminInformation',
    //             title: '账号信息',
    //             component: resolve => {
    //                 require(['@/views/user/adminInformation.vue'], resolve);
    //             },
    //             meta: {
    //                 requiresAuth: true
    //             }
    //         },
    //         {
    //             path: 'modifyAdminPwd',
    //             icon: 'android-create',
    //             name: 'modifyAdminPwd',
    //             title: '修改密码',
    //             component: resolve => {
    //                 require(['@/views/user/modifyAdminPwd.vue'], resolve);
    //             },
    //             meta: {
    //                 requiresAuth: true
    //             }
    //         },
    //     ]
    // },
]

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    ...appRouter,
    page500,
    page403,
    page404
]