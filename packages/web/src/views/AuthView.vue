<!-- 认证页面 -->
<template>
    <div class="auth">
        <div class="content">
            <div class="title">
                <h1>{{ $t('get_gateway_token') }}</h1>
            </div>
            <div class="img">
                <a-carousel >
                    <img :src="img01Src" alt="get token tutorial">
                    <img :src="img02Src" alt="get token tutorial">
                </a-carousel>
            </div>
            <div class="desc">
                <p>{{ $t('step_1_click_get_token_button') }}</p>
                <p>{{ $t('step_2_confirm_token_popup') }}</p>
            </div>
            <div class="btn">
                <a-button
                    type="primary"
                    class="get-token-btn"
                    :loading="countStore.counting"
                    @click="getToken"
                >{{ countStore.counting ? countStore.countText : $t('get_token') }}</a-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash';
import { onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { getCubeToken, getServerInfo } from '@/api';
import { useSseStore } from '@/stores/sse';
import { useCountStore } from '@/stores/count';
import i18n from '@/i18n';
import EnImg01 from '@/assets/en_get_token_01.png';
import EnImg02 from '@/assets/en_get_token_02.png';
import CnImg01 from '@/assets/cn_get_token_01.png';
import CnImg02 from '@/assets/cn_get_token_02.png';

const router = useRouter();
const sseStore = useSseStore();
const countStore = useCountStore();

const img01Src = computed(() => {
    return i18n.global.locale === 'en-us'
        ? EnImg01
        : CnImg01;
});

const img02Src = computed(() => {
    return i18n.global.locale === 'en-us'
        ? EnImg02
        : CnImg02;
});

const getToken = async () => {
    try {
        countStore.startCount();
        const res = await getCubeToken();
        const resError = _.get(res, 'data.error');
        if (resError !== 0) {
            message.error(`Get token failed`);
        }
        countStore.stopCount();
    } catch (err: any) {
        countStore.stopCount();
        const errContent = `${err.name}: ${err.message}`;
        console.error(`getCubeToken() failed: ${errContent}`);
        message.error(errContent);
    }
};

watch(() => countStore.counting, async (newVal) => {
    if (!newVal) {
        console.log('Count stop');
        // 倒计时停止
        const res = await getServerInfo();
        const resError = _.get(res, 'data.error');
        const resTokenValid = _.get(res, 'data.data.cubeTokenValid');
        if (resError === 0 && resTokenValid) {
            router.push({ name: 'home' });
        }
    }
});

onMounted(() => {
    sseStore.startSse();
    countStore.testCount();
});
</script>

<style lang="scss" scoped>
.auth {
    width: 100%;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    .content {

        .title h1 {
            color: rgba(66, 66, 66, 1);
            font-size: 20px;
            margin-bottom: 16px;
            text-align: center;
        }

        .img {
            background-color: rgba(200, 200, 255, 0.4);
            width: 365px;
            height: 279px;
            margin-bottom: 12px;
        }

        .desc p {
            margin-bottom: 4px;
            color: rgba(66, 66, 66, 0.5);
        }

        .btn {
            margin-top: 20px;
            text-align: center;

            .get-token-btn {
                width: 200px;
                height: 40px;
                border-radius: 8px;
            }
        }
    }
}

:deep(.ant-carousel .slick-dots li button) {
    width: 8px;
    height: 8px;
    margin-right: 10px;
    background-color: #bbbbbb;
    border-radius: 50%;
}

:deep(.ant-carousel .slick-dots li.slick-active) {
    width: 16px;
}

:deep(.ant-carousel .slick-dots-bottom) {
    bottom: 0;
}
</style>
