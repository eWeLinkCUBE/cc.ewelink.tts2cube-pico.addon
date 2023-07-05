<!-- 文本转语音栏 -->
<template>
    <div class="tab-transform">
        <DescTitle header="语音合成" description="输入一段文本，转换为语音播报" />
        <div class="content">
            <div class="content-item flex flex-center">
                <p class="title">语言</p>
                <a-select
                    class="select language"
                    v-model:value="languageValue"
                    :options="LANGUAGE_OPTIONS"
                ></a-select>
            </div>
            <div class="content-item flex">
                <p class="title input-text">文本</p>
                <a-textarea
                    class="textarea input-text"
                    placeholder="请输入需要转换为语音的文本，输入的文本需要和选择的语言一致"
                    v-model:value="inputText"
                    :rows="4"
                    showCount
                    :maxlength="500"
                ></a-textarea>
            </div>
            <div class="content-item flex flex-center">
                <p class="title store-audio">是否存储转换后的音频</p>
                <a-radio-group
                    v-model:value="ifStoreValue"
                    :options="IF_STORE_OPTIONS"
                ></a-radio-group>
            </div>
            <div class="content-item">
                <div class="trans-play-btn-wrap">
                    <a-button
                        class="trans-play-btn"
                        type="primary"
                        @click="transformText"
                    >转换并播放</a-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import DescTitle from '@/components/DescTitle.vue';

/** 合成音频语言选项 */
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

/** 是否存储音频选项 */
const IF_STORE_OPTIONS = [
    {
        label: '是',
        value: 'yes'
    },
    {
        label: '否',
        value: 'no'
    }
];

/** 合成音频的语言 */
const languageValue = ref('');
/** 合成音频所需的输入文本 */
const inputText = ref('');
/** 是否保存音频文件 */
const ifStoreValue = ref('yes');

const transformText = () => {
    console.log('transform text');
};

onMounted(() => {
    languageValue.value = 'en-US';
});
</script>

<style lang="scss" scoped>
.content {
    padding: 0 15px;
    .content-item {
        margin-bottom: 12px;

        p {
            margin-bottom: 0;
            min-width: 80px;
        }

        .textarea.input-text {
            flex: 1;
            max-width: 620px;
            margin-bottom: 20px;
        }
        .trans-play-btn-wrap {
            margin-top: 150px;
            text-align: center;

            .trans-play-btn {
                width: 200px;
                height: 40px;
                border-radius: 8px;
            }
        }
        .select.language {
            min-width: 160px;
        }
        .title.store-audio {
            margin-right: 30px;
        }
    }
    .content-item.flex {
        display: flex;
    }
    .content-item.flex-center {
        align-items: center;
    }
}
</style>
