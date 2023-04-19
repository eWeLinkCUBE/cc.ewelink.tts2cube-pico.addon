<!-- 内容主页 -->
<template>
    <div class="home">
        <!-- TODO: not for demo version -->
        <!-- <SwitchBox /> -->
        <component :is="tabComponent.component" />
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
// TODO: not for demo version
// import SwitchBox from '@/components/SwitchBox.vue';
import { useTabStore, TAB_LIST } from '@/stores/tab';

const tabStore = useTabStore();
const tabComponent = computed(() => {
    const idx = TAB_LIST.findIndex((item) => item.name === tabStore.currentTabName);
    if (idx === -1) {
        return TAB_LIST[0];
    } else {
        return TAB_LIST[idx];
    }
});
</script>
