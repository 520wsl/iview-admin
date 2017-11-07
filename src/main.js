import Vue from 'vue';/** 导入vue */
import iView from 'iview';/** 导入iview */
import VueRouter from 'vue-router';/** 导入vue-router */
import { routers, otherRouter, appRouter } from './router';/** 导入路由配置文件 */
import Vuex from 'vuex';/** 导入vuex */
import Util from './libs/util';/** 工具类 */
import App from './app.vue';/** App.vue组件  */
import Cookies from 'js-cookie';/** 导入js-Cookies */
import 'iview/dist/styles/iview.css';/** 导入 iview样式  */

import VueI18n from 'vue-i18n';/** 导入VueI18n */
import Locales from './locale';/** 国际化 多语言配置 */
import zhLocale from 'iview/src/locale/lang/zh-CN';/** 导入语言包 中文简体 */
import enLocale from 'iview/src/locale/lang/en-US';/** 导入语言包 英文 */
import zhTLocale from 'iview/src/locale/lang/zh-TW';/** 导入语言包 中文繁体 */

Vue.use(VueRouter);/** 注册 VueRouter */
Vue.use(Vuex);/** 注册 Vuex */
Vue.use(VueI18n);/** 注册 VueI18n */
Vue.use(iView);/** 注册iView */

// 自动设置语言
const navLang = navigator.language;/**  返回浏览器应用程序的语言代码。 但是不是所有浏览器都能返回，有坑下次再看 */
const localLang = (navLang === 'zh-CN' || navLang === 'en-US') ? navLang : false;/** 判断浏览器语言是 zh-CN 或者 en-US，如果都不是返回 false； const localLang: false | "zh-CN" | "en-US" */
const lang = window.localStorage.lang || localLang || 'zh-CN';/** 从浏览器获取 localStorage 中 lang ，如果没有就使用 localLang 的 值 或者 默认值 */

Vue.config.lang = lang; /** 将lang 语言配置到vue的配置中 */

// 多语言配置
const locales = Locales;/** 国际化 多语言配置 */
const mergeZH = Object.assign(zhLocale, locales['zh-CN']); /** Object.assign() 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。这里是合并对象 参考网站：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign */
const mergeEN = Object.assign(enLocale, locales['en-US']);
const mergeTW = Object.assign(zhTLocale, locales['zh-TW']);
Vue.locale('zh-CN', mergeZH);/** 通过 locale 将 语言包注册到vue中去，这块没有找到资料，一脸懵逼。。。 */
Vue.locale('en-US', mergeEN);
Vue.locale('zh-TW', mergeTW);

// 路由配置
const RouterConfig = {
    // mode: 'history',
    routes: routers
};

const router = new VueRouter(RouterConfig);/** 实例化一个vue router */
/**
全局钩子
导航守卫

const router = new VueRouter({ ... })
router.beforeEach((to, from, next) => {
    // do something
    next();
});

router.afterEach((to, from, next) => {
    console.log(to.path);
});

每个钩子方法接收三个参数：
to: Route : 即将要进入的目标 [路由对象]
from: Route : 当前导航正要离开的路由
next: Function : 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next
方法的调用参数。
next(): 进行管道中的下一个钩子。如果全部钩子执行完了，则导航的状态就是confirmed （确认的）。
next(false): 中断当前的导航。如果浏览器的 URL 改变了（可能是用户手动或者浏览器后退按钮），那么 URL 地址会重置到 from
路由对应的地址。
next('/') 或者 next({ path: '/' }): 跳转到一个不同的地址。当前的导航被中断，然后进行一个新的导航。

确保要调用 next方法，否则钩子就不会被 resolved。
 */
router.beforeEach((to, from, next) => { /** router.beforeEach 在路由切换开始时调用 */
    iView.LoadingBar.start();/** LoadingBar 加载进度条 iView.LoadingBar.start(); 开始从 0 显示进度条，并自动加载进度; LoadingBar 只会在全局创建一个，因此在任何位置调用的方法都会控制这同一个组件。主要使用场景是路由切换和Ajax，因为这两者都不能拿到精确的进度，LoadingBar 会模拟进度，当然也可以通过update()方法来传入一个精确的进度，比如在文件上传时会很有用，具体见API。 */
    Util.title(to.meta.title);/** 使用工具类，修改网站titie */
    /**
     * 判断当前是否是锁屏状态  locking : 0:未锁屏 1：锁屏状态
     * 并且前往的页面是锁屏地页面
     */
    if (Cookies.get('locking') === '1' && to.name !== 'locking') {  // 判断当前是否是锁定状态
        next(false);/** next(false): 中断当前的导航。如果浏览器的 URL 改变了（可能是用户手动或者浏览器后退按钮），那么 URL 地址会重置到 from 路由对应的地址。 */
        /** 不留历史记录调到 锁屏界面 */
        router.replace({
            name: 'locking'
        });
    } else if (Cookies.get('locking') === '0' && to.name === 'locking') { /** 如果现在是 未锁屏 装态 并且 要去的界面是 锁屏路由 */
        next(false);/** 中断当前的导航，返回到原来的界面 */
    } else {
        if (!Cookies.get('user') && to.name !== 'login') {  // 判断是否已经登录且前往的页面不是登录页
            next({
                name: 'login'
            });
        } else if (Cookies.get('user') && to.name === 'login') {  // 判断是否已经登录且前往的是登录页
            Util.title();
            next({
                name: 'home_index'
            });
        } else {
            /**
             * otherRouter：作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
             * appRouter： 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
             * getRouterObjByName：在路由列表中匹配 to.name 的路由，并且返回匹配到的路由对象
             * access： 权限
             */
            if (Util.getRouterObjByName([otherRouter, ...appRouter], to.name).access !== undefined) {  // 判断用户是否有权限访问当前页
                if (Util.getRouterObjByName([otherRouter, ...appRouter], to.name).access === parseInt(Cookies.get('access'))) { // if 权限 和 cookie 中的相同
                    Util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next);  // 如果在地址栏输入的是一级菜单则默认打开其第一个二级菜单的页面
                } else {
                    router.replace({
                        name: 'error_401'
                    });
                    next();
                }
            } else {
                Util.toDefaultPage([otherRouter, ...appRouter], to.name, router, next);
            }
        }
    }
    iView.LoadingBar.finish();/** LoadingBar 加载进度条 iView.LoadingBar.finish(); 结束进度条，自动补全剩余进度 */
});

/**
 * 全局后置钩子
 * 你也可以注册全局后置钩子，然而和守卫不同的是，这些钩子不会接受 next 函数也不会改变导航本身：
 * 路由执行完后
 *  1、 结束进度条
 *  2、页面返回顶部
 *
 */
router.afterEach(() => {
    iView.LoadingBar.finish();/** LoadingBar 加载进度条 iView.LoadingBar.finish(); 结束进度条，自动补全剩余进度 */
    window.scrollTo(0, 0);/** scrollTo() 方法可把内容滚动到指定的坐标。 */
});

// 状态管理
const store = new Vuex.Store({
    state: {
        /**
         * 路由数据
         * otherRouter：作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
         * appRouter： 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
         */
        routers: [
            otherRouter,
            ...appRouter
        ],
        menuList: [],
        tagsList: [...otherRouter.children], /**  作为Main组件的子页面展示但是不在左侧菜单显示的路由 */
        /** tags 上的表现数据，会存在 local storage */
        pageOpenedList: [{
            title: '首页',
            path: '',
            name: 'home_index'
        }],
        /** tags 上 当前选中的标签 */
        currentPageName: '',
        /** tags 上 当前选中的地址 */
        currentPath: [
            {
                title: '首页',
                path: '',
                name: 'home_index'
            }
        ],  // 面包屑数组
        openedSubmenuArr: [],  // 要展开的菜单数组
        menuTheme: '', // 主题
        theme: '',
        cachePage: [],/** 缓存页面 name 列表 */
        lang: '',
        isFullScreen: false,
        dontCache: ['text-editor']  // 在这里定义你不想要缓存的页面的name属性值(参见路由配置router.js)
    },
    getters: {

    },
    mutations: {
        /**
         *
         *设置 不在左侧菜单显示的路由
         * @param { '状态' } state
         * @param { '作为Main组件的子页面展示但是不在左侧菜单显示的路由' } list
         */
        setTagsList (state, list) {
            state.tagsList.push(...list);
        },
        /**
         * 将 关闭的 页面 从  state.cachePage 中删除
         * @param {*} state
         * @param {*} name
         */
        closePage (state, name) {
            state.cachePage.forEach((item, index) => { /** forEach() 方法用于调用数组的每个元素，并将元素传递给回调函数。 */
                if (item === name) {
                    state.cachePage.splice(index, 1);/** splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目。 index 规定添加/删除项目的位置， 1 删除的长度 */
                }
            });
        },
        increateTag (state, tagObj) {
            if (!Util.oneOf(tagObj.name, state.dontCache)) {/** tagObj 对象 是否 存在于 dontCache（不缓存的列表） */
                state.cachePage.push(tagObj.name);/** 追加到   缓存页面 name 列表 */
                localStorage.cachePage = JSON.stringify(state.cachePage);/** 将 state.cachePage 缓存到 localStorage.cachePage */
            }
            state.pageOpenedList.push(tagObj);
        },
        initCachepage (state) {
            if (localStorage.cachePage) {
                state.cachePage = JSON.parse(localStorage.cachePage);
            }
        },
        /** 移除tag */
        removeTag (state, name) {
            state.pageOpenedList.map((item, index) => {
                if (item.name === name) {
                    state.pageOpenedList.splice(index, 1);
                }
            });
        },
        pageOpenedList (state, get) {
            let openedPage = state.pageOpenedList[get.index];
            if (get.argu) {
                openedPage.argu = get.argu;
            }
            if (get.query) {
                openedPage.query = get.query;
            }
            state.pageOpenedList.splice(get.index, 1, openedPage);/** 删除 位于 get.index 的 元素，并用 opendPage 替换*/
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        clearAllTags (state) {
            state.pageOpenedList.splice(1);
            router.push({
                name: 'home_index'
            });
            state.cachePage.length = 0;
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
            let newCachepage = state.cachePage.filter(item => {
                return item === currentName;
            });
            state.cachePage = newCachepage;
            localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList);
        },
        setOpenedList (state) {
            state.pageOpenedList = localStorage.pageOpenedList ? JSON.parse(localStorage.pageOpenedList) : [otherRouter.children[0]];
        },
        setCurrentPath (state, pathArr) {
            state.currentPath = pathArr;
        },
        setCurrentPageName (state, name) {
            state.currentPageName = name;
        },
        addOpenSubmenu (state, name) {
            let hasThisName = false;
            let isEmpty = false;
            if (name.length === 0) {
                isEmpty = true;
            }
            if (state.openedSubmenuArr.indexOf(name) > -1) {
                hasThisName = true;
            }
            if (!hasThisName && !isEmpty) {
                state.openedSubmenuArr.push(name);
            }
        },
        clearOpenedSubmenu (state) {
            state.openedSubmenuArr.length = 0;
        },
        changeMenuTheme (state, theme) {
            state.menuTheme = theme;
        },
        changeMainTheme (state, mainTheme) {
            state.theme = mainTheme;
        },
        lock (state) {
            Cookies.set('locking', '1');
        },
        unlock (state) {
            Cookies.set('locking', '0');
        },
        /** 设置菜单列表 */
        setMenuList (state, menulist) {
            state.menuList = menulist;
        },
        // 权限菜单过滤相关
        updateMenulist (state) {
            let accessCode = parseInt(Cookies.get('access'));
            let menuList = [];
            appRouter.forEach((item, index) => {
                if (item.access !== undefined) {
                    if (Util.showThisRoute(item.access, accessCode)) {
                        if (item.children.length === 1) {
                            menuList.push(item);
                        } else {
                            let len = menuList.push(item);
                            let childrenArr = [];
                            childrenArr = item.children.filter(child => {
                                if (child.access !== undefined) {
                                    if (child.access === accessCode) {
                                        return child;
                                    }
                                } else {
                                    return child;
                                }
                            });
                            menuList[len - 1].children = childrenArr;
                        }
                    }
                } else {
                    if (item.children.length === 1) {
                        menuList.push(item);
                    } else {
                        let len = menuList.push(item);
                        let childrenArr = [];
                        childrenArr = item.children.filter(child => {
                            if (child.access !== undefined) {
                                if (Util.showThisRoute(child.access, accessCode)) {
                                    return child;
                                }
                            } else {
                                return child;
                            }
                        });
                        let handledItem = JSON.parse(JSON.stringify(menuList[len - 1]));
                        handledItem.children = childrenArr;
                        menuList.splice(len - 1, 1, handledItem);
                    }
                }
            });
            state.menuList = menuList;
        },
        setAvator (state, path) {
            localStorage.avatorImgPath = path;
        },
        switchLang (state, lang) {
            state.lang = lang;
            Vue.config.lang = lang;
        },
        handleFullScreen (state) {
            let main = document.body;
            if (state.isFullScreen) {
                /**
                 * 退出全屏
                 */
                if (document.exitFullscreen) {
                    document.exitFullscreen();/** Document.exitFullscreen() 方法用于让当前文档退出全屏模式（原文表述不准确，详见备注）。 */
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                /**
                 * 进入全屏
                 */
                if (main.requestFullscreen) {
                    main.requestFullscreen();
                } else if (main.mozRequestFullScreen) {
                    main.mozRequestFullScreen();
                } else if (main.webkitRequestFullScreen) {
                    main.webkitRequestFullScreen();
                } else if (main.msRequestFullscreen) {
                    main.msRequestFullscreen();
                }
            }
        },
        changeFullScreenState (state) {
            state.isFullScreen = !state.isFullScreen;
        }
    },
    actions: {

    }
});

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
        this.$store.commit('initCachepage');
        // 权限菜单过滤相关
        this.$store.commit('updateMenulist');
        // 全屏相关
        document.addEventListener('fullscreenchange', () => {
            this.$store.commit('changeFullScreenState');
        });
        document.addEventListener('mozfullscreenchange', () => {
            this.$store.commit('changeFullScreenState');
        });
        document.addEventListener('webkitfullscreenchange', () => {
            this.$store.commit('changeFullScreenState');
        });
        document.addEventListener('msfullscreenchange', () => {
            this.$store.commit('changeFullScreenState');
        });
    },
    created () {
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);//设置 不在左侧菜单显示的路由
    }
});
