<!-- 带描述的标题 -->
<template>
    <div class="desc-title">
        <h1>{{ props.header }}</h1>
        <p v-if="props.description">{{ props.description }}</p>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    header: string;
    description?: string;
}>()
</script>

<style lang="scss" scoped>
.desc-title {
    padding: 20px 15px;

    h1 {
        font-size: 16px;
        color: #424242;
        margin: 0;
    }

    p {
        font-size: 14px;
        color: #424242;
        opacity: 0.5;
        margin-top: 2px;
        margin-bottom: 0;
    }
}
</style>
