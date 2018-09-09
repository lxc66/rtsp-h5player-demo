import {otherRouter, appRouter} from '@/router/router';

const app = {
    state: {
        menuList: [],
        tagsList: [...otherRouter.children],
        pageOpenedList: [{
            title: '首页',
            path: '',
            name: 'home'
        }],
        routers: [
            otherRouter,
            ...appRouter
        ],
        currentPageName: ''
    },
    mutations: {
        updateMenulist (state) {
            state.menuList = appRouter;
        },
        setTagsList (state, list) {
            state.tagsList.push(...list);
        },
        pageOpenedList (state, get) {
            let openedPage = state.pageOpenedList[get.index];
            if (get.argu) {
                openedPage.argu = get.argu;
            }
            if (get.query) {
                openedPage.query = get.query;
            }
            state.pageOpenedList.splice(get.index, 1, openedPage);
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        setOpenedList (state) {
            state.pageOpenedList = localStorage.pageOpenedList ? JSON.parse(localStorage.pageOpenedList) : [otherRouter.children[0]];
        },
        setCurrentPageName (state, name) {
            state.currentPageName = name;
        },
        increateTag (state, tagObj) {
            // if (!Util.oneOf(tagObj.name, state.dontCache)) {
            //     state.cachePage.push(tagObj.name);
            //     localStorage.cachePage = JSON.stringify(state.cachePage);
            // }
            state.pageOpenedList.push(tagObj);
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        removeTag (state, name) {
            state.pageOpenedList.map((item, index) => {
                if (item.name === name) {
                    state.pageOpenedList.splice(index, 1);
                }
            });
        },
        clearAllTags (state) {
            state.pageOpenedList.splice(1);
            // state.cachePage.length = 0;
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        clearOtherTags (state, vm) {
            let currentName = vm.$route.name;
            let currentIndex = 0;
            state.pageOpenedList.forEach((item, index) => {
                if (item.name === currentName) {
                    currentIndex = index;
                }
            });
            if (currentIndex === 0) {
                state.pageOpenedList.splice(1);
            } else {
                state.pageOpenedList.splice(currentIndex + 1);
                state.pageOpenedList.splice(1, currentIndex - 1);
            }
            // let newCachepage = state.cachePage.filter(item => {
            //     return item === currentName;
            // });
            // state.cachePage = newCachepage;
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        closePage (state, name) {
            // state.cachePage.forEach((item, index) => {
            //     if (item === name) {
            //         state.cachePage.splice(index, 1);
            //     }
            // });
        },
    }
};

export default app;
