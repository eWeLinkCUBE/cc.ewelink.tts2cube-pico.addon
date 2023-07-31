import { createApp } from 'vue';
import {
    Form,
    Button,
    Dropdown,
    Menu,
    Table,
    ConfigProvider,
    Input,
    Carousel,
    Select,
    Radio,
    Progress,
    Modal
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
app.use(Form);
app.use(Button);
app.use(Dropdown);
app.use(Menu);
app.use(Table);
app.use(ConfigProvider);
app.use(Input);
app.use(Carousel);
app.use(Progress);
app.use(Select);
app.use(Radio);
app.use(Modal);

app.mount('#app');
