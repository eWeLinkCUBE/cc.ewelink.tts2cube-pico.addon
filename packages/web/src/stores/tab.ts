import { defineStore } from 'pinia';
import TabList from '@/components/tabs/TabList.vue';
import TabSettings from '@/components/tabs/TabSettings.vue';
import TabTransform from '@/components/tabs/TabTransform.vue';

export const TAB_NAME_SETTINGS = 'settings';
export const TAB_NAME_LIST = 'list';
export const TAB_NAME_TRANSFORM = 'transform';
export const TAB_LIST = [
    {
        id: 0,
        name: TAB_NAME_TRANSFORM,
        component: TabTransform
    },
    {
        id: 1,
        name: TAB_NAME_LIST,
        component: TabList
    },
    /* 这个选项被合并到语音合成页面，以防万一，留着。
    {
        id: 2,
        name: TAB_NAME_SETTINGS,
        component: TabSettings
    }
    */
]

export const useTabStore = defineStore('tab', {
    state: () => {
        return {
            currentTabName: TAB_NAME_TRANSFORM,  // 当前功能 tab 名称
        };
    },
    actions: {
        setCurrentTabName(tabName: string) {
            this.currentTabName = tabName;
        }
    },
    // persist: true
});
