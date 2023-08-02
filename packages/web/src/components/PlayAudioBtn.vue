<!-- 播放音乐的按钮 -->
<template>
    <a-dropdown placement="bottomRight" :trigger="['click']" :disabled="disableDropdown">
        <div class="play-audio-btn" @click="handlePlayAudioBtnClick">
            <img v-if="soundState === SOUND_STATE_READY" src="@/assets/play.png" alt="play button" width="27" height="27">
            <img v-else src="@/assets/pause-bar.png" class="pause-bar" alt="pause button bar" width="27" height="27">

            <a-progress
                v-if="soundState !== SOUND_STATE_READY"
                type="circle"
                class="progress-bar"
                :percent="percent"
                :width="27"
                :showInfo="false"
                :strokeWidth="9"
                strokeColor="dodgerblue"
            />
        </div>
        <template #overlay>
            <a-menu>
                <a-menu-item @click="playOnWeb">
                    <img class="play-icon" src="@/assets/play-on-web.png" alt="play on web">
                    <span>{{ $t('web_browser') }}</span>
                </a-menu-item>
                <a-menu-item @click="playOnIhostDebounced">
                    <img class="play-icon" src="@/assets/play-on-ihost.png" alt="play on iHost">
                    <span>{{ $t('ihost_speaker') }}</span>
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script lang="ts" setup>
import _ from 'lodash';
import { ref, onBeforeUnmount } from 'vue';
import { useSound } from '@vueuse/sound';
import { message } from 'ant-design-vue';
import { playAudioOnIhost } from '@/api';
import i18n from '@/i18n';

const props = defineProps<{
    audioUrl: string;
}>();

const SOUND_STATE_READY = 0;
const SOUND_STATE_PLAYING = 1;
const SOUND_STATE_PAUSED = 2;

const sound = useSound(props.audioUrl);

// 音频状态
const soundState = ref(SOUND_STATE_READY);

// 是否禁用下拉框
const disableDropdown = ref(false);

// 音频播放进度百分比
const percent = ref(0)

// Circle bar update interval, unit ms (33 - 30FPS, 17 - 60FPS)
const timeInterval = 17;

let timer: any = null;
let playedTime = timeInterval;

const clearTimer = () => {
    if (timer) {
        clearInterval(timer);
    }
};

const setTimer = () => {
    timer = setInterval(() => {
        if (sound.isPlaying.value) {
            // Audio file is playing.
            const soundTime = sound.duration.value as number;
            const v = playedTime * 100 / soundTime;
            playedTime += timeInterval;
            percent.value = Math.ceil(v);
        } else {
            // Audio file is over.
            clearTimer();
            playedTime = 0;
            soundState.value = SOUND_STATE_READY;
            disableDropdown.value = false;
        }
    }, timeInterval);
};

// 处理点击事件
const handlePlayAudioBtnClick = () => {
    if (disableDropdown.value) {
        if (soundState.value === SOUND_STATE_PLAYING) {
            soundState.value = SOUND_STATE_PAUSED;
            sound.pause();
            clearTimer();
        } else {
            soundState.value = SOUND_STATE_PLAYING;
            sound.play();
            setTimer();
        }
    }
};

const playOnWeb = () => {
    if (!sound.duration.value) {
        message.error(i18n.global.t('play_failed'));
        return;
    }

    disableDropdown.value = true;
    soundState.value = SOUND_STATE_PLAYING;
    sound.play();
    setTimer();
};

const playOnIhost = async () => {
    // 获取 URL 中的音频文件名
    // http://localhost:8323/_audio/1689926050739.wav
    //                             ^-----------------
    const i = props.audioUrl.lastIndexOf('/');
    const audioUrl = props.audioUrl.slice(i + 1);
    await playAudioOnIhost({ audioUrl });
};

const playOnIhostDebounced = _.debounce(playOnIhost, 250);

onBeforeUnmount(() => {
    clearTimer();
});
</script>

<style lang="scss" scoped>
.play-audio-btn {
    display: inline-block;
    position: relative;
    margin-right: 20px;
}
.play-audio-btn:hover {
    cursor: pointer;
}

.pause-bar {
    position: absolute;
}

.play-icon {
    width: 26px;
    margin-right: 8px;
}
</style>
