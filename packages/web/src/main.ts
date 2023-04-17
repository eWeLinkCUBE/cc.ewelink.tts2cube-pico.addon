import { createApp } from 'vue';
import { Button } from 'ant-design-vue';

import App from './App.vue';
import pinia from './stores';
import router from './router';

import 'ant-design-vue/dist/antd.css';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(Button);

app.mount('#app');
