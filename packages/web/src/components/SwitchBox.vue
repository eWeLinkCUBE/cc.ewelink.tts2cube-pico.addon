<!-- 功能切换盒子 -->
<template>
    <div class="switch-box">
        <img
            v-for="tab in tabList"
            :key="tab.id"
            class="tab-icon"
            :src="tabIcon(tab.name)"
            alt="tab icon"
            @click="() => handleClick(tab.name)"
        >
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import {
    useTabStore,
    TAB_LIST,
    TAB_NAME_LIST,
    TAB_NAME_SETTINGS,
    TAB_NAME_TRANSFORM
} from '@/stores/tab';
import TabSettingsIcon from '@/assets/tab_settings.png';
import TabListIcon from '@/assets/tab_list.png';
import TabTransformIcon from '@/assets/tab_transform.png';

const tabStore = useTabStore();
// 将当前选中的 tab 项过滤掉
const tabList = computed(() => {
    const result = [];
    for (const item of TAB_LIST) {
        if (item.name !== tabStore.currentTabName) {
            result.push(item);
        }
    }
    return result;
});

const tabIcon = (tabName: string) => {
    let result = '';
    switch (tabName) {
        case TAB_NAME_LIST:
            result = TabListIcon;
            break;

        case TAB_NAME_SETTINGS:
            result = TabSettingsIcon;
            break;

        case TAB_NAME_TRANSFORM:
            result = TabTransformIcon;
        default:
            break;
    }
    return result;
};

const handleClick = (tabName: string) => {
    tabStore.setCurrentTabName(tabName);
};
</script>

<style lang="scss" scoped>
.switch-box {
    position: absolute;
    top: 0;
    right: 0;
    padding: 18px 0 0;

    .tab-icon {
        width: 27px;
        margin-right: 24px;
        cursor: pointer;
    }
}
</style>
