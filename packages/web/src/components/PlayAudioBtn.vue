<!-- 播放音乐的按钮 -->
<template>
    <div class="play-audio-btn">
        <img v-if="switchState === 'off'" src="@/assets/play.png" alt="play button" @click="playAudio">

        <a-progress
            v-if="switchState === 'on'"
            type="circle"
            :percent="percent"
            :width="27"
            :showInfo="false"
            :strokeWidth="9"
            strokeColor="dodgerblue"
            @click="pauseAudio"
        />
    </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeUnmount } from 'vue';
import { useSound } from '@vueuse/sound';
import { message } from 'ant-design-vue';

const props = defineProps<{
    audioUrl: string;
}>();

// State off - music off
// State on - music on
const switchState = ref('off');
const percent = ref(0)

const sound = useSound(props.audioUrl);
// Circle bar update interval, unit ms (33 - 30FPS, 17 - 60FPS)
const timeInterval = 17;

let timer: null | number = null;
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
            switchState.value = 'off';
        }
    }, timeInterval);
};

const playAudio = () => {
    if (!sound.duration.value) {
        message.error('Audio file not ready');
    } else {
        switchState.value = 'on';
        sound.play();
        setTimer();
    }
};

const pauseAudio = () => {
    switchState.value = 'off';
    sound.pause();
    clearTimer();
};

onBeforeUnmount(() => {
    clearTimer();
});
</script>

<style lang="scss" scoped>
.play-audio-btn {
    display: inline-block;
}
</style>
