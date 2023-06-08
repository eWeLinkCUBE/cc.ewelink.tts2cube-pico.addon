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
                    :loading="btnLoading"
                    @click="getToken"
                >{{ btnLoading ? countDownText : $t('get_token') }}</a-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { getCubeToken } from '@/api';

/** 倒计时时长 5 分钟 */
const COUNT_TIME = 300;

const router = useRouter();
const btnLoading = ref(false);
const countDownText = ref('');

let timerId: any = null;
let timeCount = COUNT_TIME;

/** 获取时间字符串 */
const getTimeStr = (n: number) => {
    const min = Math.floor(n / 60);
    const sec = n - (min * 60);
    let str = '';
    if (min) {
        str += `${min}min`;
    }
    if (sec) {
        str += `${sec}s`;
    }
    return str;
};

/** 停止倒计时 */
const stopCountDown = () => {
    btnLoading.value = false;
    if (timerId) {
        clearInterval(timerId);
    }
    timerId = null;
    timeCount = COUNT_TIME;
};

/** 开始倒计时 */
const startCountDown = () => {
    stopCountDown();

    btnLoading.value = true;
    countDownText.value = getTimeStr(--timeCount);
    timerId = setInterval(() => {
        if (--timeCount > 0) {
            countDownText.value = getTimeStr(timeCount);
        } else {
            stopCountDown();
        }
    }, 1000);
};

const getToken = async () => {
    try {
        startCountDown();
        const res = await getCubeToken();
        stopCountDown();
        if (res.data.error === 0) {
            router.push({ name: 'home' });
        } else {
            message.error(`Get token failed`);
        }
    } catch (err: any) {
        stopCountDown();
        const errContent = `${err.name}: ${err.message}`;
        console.error(`getCubeToken() failed: ${errContent}`);
        message.error(errContent);
    }
};
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
