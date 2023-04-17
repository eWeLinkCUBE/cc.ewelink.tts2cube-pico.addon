import { createI18n } from 'vue-i18n';

import zhCN from './zh_CN';
import enUS from './en_US';

const messages = {
    'zh-cn': zhCN,
    'en-us': enUS
}

const i18n = createI18n({
    locale: 'en-us',
    messages
});

export default i18n;
