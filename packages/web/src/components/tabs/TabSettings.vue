<!-- 设置栏 -->
<template>
    <div class="tab-settings">
        <DescTitle header="配置" description="文本转换为语音的参数配置" />
        <div class="content">
            <div class="content-item">
                <span class="title language">语言</span>
                <a-select
                    class="select language"
                    v-model:value="languageValue"
                    :options="LANGUAGE_OPTIONS"
                ></a-select>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import DescTitle from '@/components/DescTitle.vue';

const LANGUAGE_OPTIONS = [
    {
        key: 0,
        value: 'en-US',
        label: '英语（美国）'
    },
    {
        key: 1,
        value: 'en-GB',
        label: '英语（英国）'
    },
    {
        key: 2,
        value: 'de-DE',
        label: '德语'
    },
    {
        key: 3,
        value: 'es-ES',
        label: '西班牙语'
    },
    {
        key: 4,
        value: 'fr-FR',
        label: '法语'
    },
    {
        key: 5,
        value: 'it-IT',
        label: '意大利语'
    }
];

const languageValue = ref('');
</script>

<style lang="scss" scoped>
.content {
    padding: 0 15px;
    .content-item {
        .title.language {
            display: inline-block;
            min-width: 170px;
        }
        .select.language {
            min-width: 160px;
        }
    }
}
</style>
