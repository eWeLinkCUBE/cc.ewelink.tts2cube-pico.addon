<!-- 页面入口 -->
<template>
    <RouterView />
</template>

<script lang="ts" setup>
import { RouterView } from 'vue-router';
import queryString from 'query-string';
import _ from 'lodash';
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
    languageStore.setLanguage(currentLanguage);
    // @ts-ignore
    i18n.global.locale = currentLanguage;
};

initLanguage();
</script>
