<!-- 语音列表栏 -->
<template>
    <div class="tab-list">
        <DescTitle :header="$t('audio_file')" />
        <div class="table">
            <a-table
                :data-source="tableData"
                :columns="columns"
                size="middle"
            >
                <template #bodyCell="{ column, text, record }">
                    <!-- 文件名称栏 -->
                    <template v-if="column.dataIndex === 'filename'">
                        <div class="editable-cell">
                            <!-- 点击保存按钮保存 -->
                            <div v-if="editableData[record.key]" class="editable-cell-input-wrapper">
                                <span>{{ record }}</span>
                                <a-input v-model:value="editableData[record.key].filename" @pressEnter="() => saveCell(record.key)" />
                                <check-outlined class="editable-cell-icon-check" @click="() => saveCell(record.key)" />
                            </div>

                            <!-- 点击编辑按钮进入编辑模式 -->
                            <div v-else class="editable-cell-text-wrapper">
                                {{ text || ' ' }}
                                <edit-outlined class="editable-cell-icon" @click="() => editCell(record.key)" />
                            </div>
                        </div>
                    </template>

                    <!-- 操作栏 -->
                    <template v-else-if="column.dataIndex === 'operation'">
                        <PlayAudioBtn :audio-url="record.url" />
                        |
                        <span @click="() => downloadAudio(record.id)">下载</span>
                        |
                        <span @click="() => removeAudio(record.id)">删除</span>
                    </template>
                </template>
            </a-table>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { saveAs } from 'file-saver';
import { CheckOutlined, EditOutlined } from '@ant-design/icons-vue';
import _ from 'lodash';
import DescTitle from '@/components/DescTitle.vue';
import PlayAudioBtn from '@/components/PlayAudioBtn.vue';
import { getAudioList } from '@/api';

// 表格栏配置
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

// 表格数据
const tableData = ref<{
    // 以下数据由接口返回
    key: number;
    id: string;
    filename: string;
    text: string;
    config: string;
    time: string;
    url: string;
}[]>([]);

// 可编辑数据
const editableData = reactive({}) as any;

// 保存单元格
const saveCell = (key: any) => {
    // TODO: 调用保存音频文件名称接口
    Object.assign(tableData.value.filter((item) => item.key === key)[0], editableData[key]);
    delete editableData[key];
};

// 编辑单元格
const editCell = (key: any) => {
    editableData[key] = _.cloneDeep(tableData.value.filter((item) => item.key === key)[0]);
};

// 下载音频文件
const downloadAudio = (id: string) => {
    const i = _.findIndex(tableData.value, { id });
    if (i === -1) {
        console.warn(`audio id ${id} not found`);
    }
    const audio = tableData.value[i];
    saveAs(audio.url, audio.filename);
};

// 删除音频文件
const removeAudio = (id: string) => {
    console.log('remove audio', id);
};

onMounted(async () => {
    try {
        // 页面刷新时，获取第一页的音频数据
        const res = await getAudioList();
        if (res.data.error === 0) {
            tableData.value = res.data.data.audioList;
        } else {
            // TODO: handle msg
            console.log(res.data.msg);
        }
    } catch (err) {
        // TODO: handle error
        // AxiosError:
        // err.message - Network Error
        // err.name - AxiosError
        // err.code - ERR_NETWORK
        console.error(err);
    }
});
</script>

<style lang="scss" scoped>
.tab-list {
    .table {
        margin-top: 20px;
    }
}
</style>
