import "./public-path";
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import { routes } from "./router";
import store from "@/store";
import "@/filter";

const packageName = require("../package.json").name;

Vue.config.productionTip = false;

let router = null;
let instance = null;

let onGlobalStateChange;
let setGlobalState;

export let exposeModule;

function VueRender(props = {}) {
  const { container } = props;
  router = new VueRouter({
    base: window.__POWERED_BY_QIANKUN__ ? `/${packageName}` : "",
    mode: "history",
    routes
  });

  instance = new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount(container ? container.querySelector("#app") : "#app");
}

/*如果不作为微应用加载则直接调用VueRender*/
if (!window.__POWERED_BY_QIANKUN__) {
  VueRender();
}

/*
 * 微应用必须暴露加载的生命周期hooks
 *
 * */
export async function bootstrap(props) {
  console.log("[vue] vue app bootstraped", props);
}

export async function mount(props) {
  return new Promise(resolve => {
    console.log("!!!!!!!![vue] props from main framework", props);
    setGlobalState = props.setGlobalState;
    onGlobalStateChange = props.onGlobalStateChange;
    onGlobalStateChange(state => {
      if (state.exposeModule) {
        exposeModule = { ...state.exposeModule };
        VueRender(props);
      }
      resolve();
    });
    setGlobalState({
      invoke: ["lodash", "moment"]
    });
  });
}

export async function unmount() {
  instance.$destroy();
  instance = null;
  router = null;
}
