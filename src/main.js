import Vue from "vue";

import App from "./App";

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import store from "./store";

Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  el: "#app",
  store,
  render: h => h(App)
});
