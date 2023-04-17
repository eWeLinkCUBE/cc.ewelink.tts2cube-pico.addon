<!-- 认证页面 -->
<template>
    <div class="auth">
        <div class="content">
            <div class="title">
                <h1>获取网关凭证</h1>
            </div>
            <div class="img"></div>
            <div class="desc">
                <p>步骤 1：点击下方“获取网关凭证”按钮</p>
                <p>步骤 2：点击“获取网关凭证”弹窗的允许按钮</p>
            </div>
            <div class="btn">
                <a-button
                    type="primary"
                    class="get-token-btn"
                    @click="getToken"
                >获取凭证</a-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
const getToken = () => {
    console.log('get token');
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
