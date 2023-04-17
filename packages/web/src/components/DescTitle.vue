<!-- 带描述的标题 -->
<template>
    <div class="desc-title">
        <h1>{{ props.header }}</h1>
        <p>{{ props.description }}</p>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    header: string;
    description: string;
}>()
</script>

<style lang="scss" scoped>
.desc-title {
    h1 {
        font-size: 18px;
    }
}
</style>
