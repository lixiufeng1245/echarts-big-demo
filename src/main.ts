import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// 引入 Element Plus 暗黑模式 CSS 变量
import "element-plus/theme-chalk/dark/css-vars.css";
import App from "./App.vue";

const app = createApp(App);
app.use(ElementPlus);
app.mount("#app");
