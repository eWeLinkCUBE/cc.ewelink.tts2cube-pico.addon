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
                    <!-- 转换并播放按钮 -->
                    <a-button
                        v-show="btnType === BTN_TYPE_INIT"
                        class="trans-play-btn"
                        type="primary"
                        @click="transformText"
                    >转换并播放</a-button>

                    <!-- 恢复播放按钮 -->
                    <a-button
                        v-show="btnType === BTN_TYPE_PAUSED"
                        class="trans-play-btn"
                        @click="continuePlayAudio"
                    >
                        <template #icon>
                            <img src="@/assets/play.png" class="play-icon" alt="play icon">
                        </template>
                        恢复播放
                    </a-button>

                    <!-- 播放中按钮 -->
                    <a-button
                        v-show="btnType === BTN_TYPE_PLAYING"
                        class="trans-play-btn"
                        @click="pausePlayAudio"
                    >
                        <template #icon>
                            <img src="@/assets/playing.gif" class="playing-icon" alt="playing icon">
                        </template>
                        播放中
                    </a-button>

                    <!-- 隐藏元素：音频播放器 -->
                    <!-- src 属性在接口返回后填入 -->
                    <audio
                        ref="audioPlayer"
                        src=""
                        @ended="handleAudioPlayerEnded"
                        @playing="handleAudioPlayerPlaying"
                    ></audio>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import DescTitle from '@/components/DescTitle.vue';
import { generateAudioFile, SERVER_PORT } from '@/api';

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
        value: true
    },
    {
        label: '否',
        value: false
    }
];

const BTN_TYPE_INIT = 0;       /* 按钮类型：初始 */
const BTN_TYPE_PLAYING = 1;    /* 按钮类型：正在播放音频 */
const BTN_TYPE_PAUSED = 2;     /* 按钮类型：音频播放已暂停 */

/** 合成音频的语言 */
const languageValue = ref('');
/** 合成音频所需的输入文本 */
const inputText = ref('');
/** 是否保存音频文件 */
const ifStoreValue = ref(true);
/** 按钮类型 */
const btnType = ref(BTN_TYPE_INIT);
/** 音频播放器元素 */
const audioPlayer = ref();

const transformText = async () => {
    if (inputText.value === '') {
        message.error('请输入转换文本');
        return;
    }

    try {
        const res = await generateAudioFile({
            language: languageValue.value,
            inputText: inputText.value,
            save: ifStoreValue.value
        });
        if (res.data.error === 0) {
            const url = `http://${location.hostname}:${SERVER_PORT}/${res.data.data.downloadUrl}`;
            audioPlayer.value.src = url;
            audioPlayer.value.play();
        }
    } catch (err) {
        console.error(err);
    }
};

const continuePlayAudio = () => {
    audioPlayer.value.play();
    btnType.value = BTN_TYPE_PLAYING;
};

const pausePlayAudio = () => {
    audioPlayer.value.pause();
    btnType.value = BTN_TYPE_PAUSED;
};

const handleAudioPlayerEnded = () => {
    btnType.value = BTN_TYPE_INIT;
};

const handleAudioPlayerPlaying = () => {
    btnType.value = BTN_TYPE_PLAYING;
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
                .play-icon {
                    width: 20px;
                    margin-right: 10px;
                }
                .playing-icon {
                    margin-right: 8px;
                }
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
