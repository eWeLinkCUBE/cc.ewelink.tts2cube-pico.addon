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
                >{{ $t('get_token') }}</a-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { getCubeToken } from '@/api';

const router = useRouter();
const btnLoading = ref(false);

const getToken = async () => {
    btnLoading.value = true;

    try {
        const res = await getCubeToken();
        if (res.data.error === 0) {
            router.push({ name: 'home' });
        } else {
            message.error(`Get token failed`);
        }
    } catch (err: any) {
        const errContent = `${err.name}: ${err.message}`;
        console.error(`getCubeToken() failed: ${errContent}`);
        message.error(errContent);
    }

    btnLoading.value = false;
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
