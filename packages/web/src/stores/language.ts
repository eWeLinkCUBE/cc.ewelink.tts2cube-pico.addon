import { defineStore } from 'pinia';

export const useLanguageStore = defineStore('language', {
    state: () => {
        return {
            language: ''
        };
    },
    actions: {
        setLanguage(v: string) {
            this.language = v;
        }
    },
    persist: true
});
