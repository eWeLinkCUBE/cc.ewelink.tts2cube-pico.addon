<!-- 文本转语音栏 -->
<template>
    <div class="tab-transform">
        <DescTitle :header="i18n.global.t('speech_synthesis')" :description="i18n.global.t('enter_some_text_and_convert_it_to_speech')" />
        <div class="content">
            <div class="content-item flex flex-center">
                <p class="title">{{ $t('language') }}</p>
                <a-select
                    class="select language"
                    v-model:value="languageValue"
                    :options="LANGUAGE_OPTIONS"
                    @change="stopPlayAudio"
                ></a-select>
            </div>
            <div class="content-item flex">
                <p class="title input-text">{{ $t('text') }}</p>
                <a-form ref="textareaForm" :model="textareaFormState" :rules="textareaFormRules" style="width: 100%;">
                    <a-form-item name="inputText" style="margin-bottom: 0;">
                        <a-textarea
                            class="textarea input-text"
                            :placeholder="i18n.global.t('enter_text_in_the_selected_language')"
                            v-model:value="textareaFormState.inputText"
                            :rows="4"
                            showCount
                            :maxlength="500"
                            @change="stopPlayAudio"
                        ></a-textarea>
                    </a-form-item>
                </a-form>
            </div>
            <div class="content-item flex flex-center">
                <p class="title store-audio">{{ $t('confirm_to_save_the_converted_audio') }}</p>
                <a-radio-group
                    v-model:value="ifStoreValue"
                    :options="IF_STORE_OPTIONS"
                    @change="stopPlayAudio"
                ></a-radio-group>
            </div>
            <div class="content-item flex flex-center">
                <p class="title play-type">{{ $t('play_audio_using') }}</p>
                <a-radio-group
                    v-model:value="audioPlayType"
                    :options="AUDIO_PLAY_TYPE"
                    @change="stopPlayAudio"
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
                    >{{ $t('convert_and_play') }}</a-button>

                    <!-- 恢复播放按钮 -->
                    <a-button
                        v-show="btnType === BTN_TYPE_PAUSED"
                        class="trans-play-btn"
                        @click="continuePlayAudio"
                    >
                        <template #icon>
                            <img src="@/assets/play.png" class="play-icon" alt="play icon">
                        </template>
                        {{ $t('play') }}
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
                        {{ $t('playing') }}
                    </a-button>

                    <!-- 隐藏元素：音频播放器 -->
                    <!-- src 属性在合成音频接口返回后填入 -->
                    <audio
                        ref="audioPlayer"
                        src=""
                        @ended="handleAudioPlayerEnded"
                        @playing="handleAudioPlayerPlaying"
                        @canplay="handleAudioCanPlay"
                    ></audio>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import DescTitle from '@/components/DescTitle.vue';
import { generateAudioFile, playAudioOnIhost, SERVER_PORT } from '@/api';
import i18n from '@/i18n';

const BTN_TYPE_INIT = 0;        /* 按钮类型：初始 */
const BTN_TYPE_PLAYING = 1;     /* 按钮类型：正在播放音频 */
const BTN_TYPE_PAUSED = 2;      /* 按钮类型：音频播放已暂停 */

const PLAY_ON_BROWSER = 0;      /* 音频播放类型：在浏览器上播放 */
const PLAY_ON_IHOST = 1;        /* 音频播放类型：在 iHost 上播放 */

/** 合成音频语言选项 */
const LANGUAGE_OPTIONS = [
    {
        key: 0,
        value: 'en-US',
        label: i18n.global.t('american_english')
    },
    {
        key: 1,
        value: 'en-GB',
        label: i18n.global.t('british_english')
    },
    {
        key: 2,
        value: 'de-DE',
        label: i18n.global.t('german_germany')
    },
    {
        key: 3,
        value: 'es-ES',
        label: i18n.global.t('european_spanish')
    },
    {
        key: 4,
        value: 'fr-FR',
        label: i18n.global.t('french_france')
    },
    {
        key: 5,
        value: 'it-IT',
        label: i18n.global.t('italian_italy')
    }
];

/** 是否存储音频选项 */
const IF_STORE_OPTIONS = [
    {
        label: i18n.global.t('yes'),
        value: true
    },
    {
        label: i18n.global.t('no'),
        value: false
    }
];

/** 音频播放方式 */
const AUDIO_PLAY_TYPE = [
    {
        label: i18n.global.t('web_browser'),
        value: PLAY_ON_BROWSER
    },
    {
        label: i18n.global.t('ihost_speaker'),
        value: PLAY_ON_IHOST
    }
];


/** 合成音频的语言 */
const languageValue = ref('en-US');
/** 是否保存音频文件 */
const ifStoreValue = ref(true);
/** 按钮类型 */
const btnType = ref(BTN_TYPE_INIT);
/** 音频播放器元素 */
const audioPlayer = ref();
/** 音频播放方式 */
const audioPlayType = ref(0);

/** 音频输入文本表单相关数据 */
const textareaForm = ref();
const textareaFormState = ref({ inputText: '' });
const textareaFormRules = {
    inputText: [
        { required: true }
    ]
};

const transformText = async () => {
    textareaForm.value.validate();
    if (textareaFormState.value.inputText === '') {
        return;
    }

    try {
        const res = await generateAudioFile({
            language: languageValue.value,
            inputText: textareaFormState.value.inputText,
            save: ifStoreValue.value
        });
        if (res.data.error === 0) {
            const url = `http://${location.hostname}:${SERVER_PORT}/${res.data.data.downloadUrl}`;
            if (audioPlayType.value === PLAY_ON_IHOST) {
                // 获取 URL 中的音频文件名
                // http://localhost:8323/_audio/1689926050739.wav
                //                             ^-----------------
                const i = url.lastIndexOf('/');
                const audioUrl = url.slice(i + 1);
                await playAudioOnIhost({ audioUrl });
            } else {
                audioPlayer.value.src = url;
                audioPlayer.value.play();
            }
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

const handleAudioCanPlay = (e: any) => {
    if (e.target.duration === 0) {
        // 音频文件不可播放
        message.error(i18n.global.t('play_failed'));
    }
};

const stopPlayAudio = () => {
    audioPlayer.value.pause();
    btnType.value = BTN_TYPE_INIT;
};
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

        .title::before {
            content: "*";
            color: #ff4d4f;
        }

        .textarea.input-text {
            flex: 1;
            max-width: 620px;
            margin-bottom: 20px;
        }
        .trans-play-btn-wrap {
            margin-top: 48px;
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
        .title.store-audio, .title.play-type {
            min-width: 160px;
            margin-right: 20px;
        }
    }
    .content-item.flex {
        display: flex;
    }
    .content-item.flex-center {
        align-items: center;
    }
}

// 隐藏 antd 默认的报错提示文本
:deep(.ant-form-item-explain.ant-form-item-explain-connected) {
    display: none;
}
</style>
