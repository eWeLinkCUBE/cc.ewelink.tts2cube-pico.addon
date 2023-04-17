<!-- 功能切换盒子 -->
<template>
    <div class="switch-box">
        <button
            v-for="tab in tabList"
            :key="tab.id"
            @click="() => handleClick(tab.name)"
        >
            {{ tab.name }}
        </button>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTabStore, TAB_LIST } from '@/stores/tab';

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

const handleClick = (tabName: string) => {
    tabStore.setCurrentTabName(tabName);
};
</script>
