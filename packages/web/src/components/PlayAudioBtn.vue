<!-- 播放音乐的按钮 -->
<template>
    <div class="play-audio-btn">
        <span @click="playAudio">播放</span>
    </div>
</template>

<script lang="ts" setup>
import { useSound } from '@vueuse/sound';

const props = defineProps<{
    audioUrl: string;
}>();

const sound = useSound(props.audioUrl);

const playAudio = () => {
    sound.play();
};
</script>

<style lang="scss" scoped>
.play-audio-btn {
    display: inline-block;
}
</style>
