<!-- 认证页面 -->
<template>
    <div class="auth">
        <div class="content">
            <div class="title">
                <h1>{{ $t('get_gateway_token') }}</h1>
            </div>
            <div class="img">
                <img src="@/assets/get-token-tutorial.png" alt="Get token tutorial">
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
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { getCubeToken, getServerInfo } from '@/api';
import { useSseStore } from '@/stores/sse';
import { useCountStore } from '@/stores/count';

const router = useRouter();
const sseStore = useSseStore();
const countStore = useCountStore();

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
</style>
