import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
// import layer from '@layui/layer-vue';
import '@layui/layer-vue/lib/index.css';
import AnimatedCounter from "vue-animated-counter"

const app = createApp(App);

app.use(router);
app.use(store);
app.use(Antd);
// app.use(layer);
app.component("AnimatedCounter", AnimatedCounter);
app.mount('#app');
