<!-- 页面入口 -->
<template>
    <a-config-provider :locale="antdLocale">
        <RouterView />
    </a-config-provider>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import queryString from 'query-string';
import _ from 'lodash';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import enUS from 'ant-design-vue/es/locale/en_US';

import { useLanguageStore } from '@/stores/language';
import i18n from '@/i18n';

// 初始化页面语言
const initLanguage = () => {
    // 1. 从 URL 的查询字符串中获取 language 字段
    const parsed = queryString.parse(location.search);
    const urlLanguage = _.get(parsed, 'language');

    // 2. 从 pinia 中获取 language 字段
    const languageStore = useLanguageStore();

    // 3. 获取浏览器的语言
    const browserLanguage = navigator.language.toLowerCase();

    let currentLanguage = '';
    if (urlLanguage && typeof urlLanguage === 'string') {
        currentLanguage = urlLanguage;
    } else if (languageStore.language) {
        currentLanguage = languageStore.language;
    } else if (browserLanguage) {
        currentLanguage = browserLanguage;
    } else {
        currentLanguage = 'en-us';
    }

    // 设置语言
    languageStore.setLanguage(currentLanguage);
    // @ts-ignore
    i18n.global.locale = currentLanguage;

    return currentLanguage;
};

// 设置 ant-design-vue 的国际化
const language = ref(initLanguage());
const antdLocale = ref();
if (language.value === 'zh-cn') {
    antdLocale.value = zhCN;
} else {
    antdLocale.value = enUS;
}
</script>
