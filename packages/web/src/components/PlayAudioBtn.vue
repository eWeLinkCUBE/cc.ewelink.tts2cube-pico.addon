<!-- 播放音乐的按钮 -->
<template>
    <div class="play-audio-btn">
        <img :src="imgSrc" :alt="imgAlt" @click="playOrPauseAudio">
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useSound } from '@vueuse/sound';
import PlayIcon from '@/assets/play.png';
import PauseIcon from '@/assets/pause.png';

const props = defineProps<{
    audioUrl: string;
}>();

const sound = useSound(props.audioUrl);

const imgSrc = computed(() => {
    if (sound.isPlaying.value) {
        return PauseIcon;
    } else {
        return PlayIcon;
    }
});

const imgAlt = computed(() => {
    if (sound.isPlaying.value) {
        return 'pause audio icon'
    } else {
        return 'play audio icon'
    }
});

const playOrPauseAudio = () => {
    if (sound.isPlaying.value) {
        sound.pause();
    } else {
        sound.play();
    }
};
</script>

<style lang="scss" scoped>
.play-audio-btn {
    display: inline-block;
}
</style>
