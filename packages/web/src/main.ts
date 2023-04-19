import { createApp } from 'vue';
import {
    Button,
    Table,
    ConfigProvider,
    Input
} from 'ant-design-vue';

import App from './App.vue';
import pinia from './stores';
import router from './router';
import i18n from './i18n';

import 'ant-design-vue/dist/antd.css';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(Button);
app.use(Table);
app.use(ConfigProvider);
app.use(Input);

app.mount('#app');
