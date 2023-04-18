<!-- 语音列表栏 -->
<template>
    <div class="tab-list">
        <DescTitle :header="$t('audio_file')" />
        <div class="table">
            <a-table
                :row-selection="{}"
                :data-source="tableData"
                :columns="columns"
                size="middle"
            ></a-table>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import DescTitle from '@/components/DescTitle.vue';

const columns = [
    {
        title: '文件名称',
        dataIndex: 'filename'
    },
    {
        title: '文本',
        dataIndex: 'text'
    },
    {
        title: '配置',
        dataIndex: 'config'
    },
    {
        title: '时间',
        dataIndex: 'time'
    },
    {
        title: '操作',
        dataIndex: 'operation'
    }
];

const tableData = ref([
    {
        key: 0,
        filename: 'abc.mp3',
        text: 'the quick brown',
        config: '英语',
        time: '2022/04/08'
    },
    {
        key: 1,
        filename: 'def.mp3',
        text: 'has a free dog',
        config: '中文',
        time: '2022/05/01'
    }
]);
</script>

<style lang="scss" scoped>
.tab-list {
    .table {
        margin-top: 20px;
    }
}
</style>
