<!-- 语音列表栏 -->
<template>
    <div class="tab-list">
        <DescTitle :header="$t('audio_file')" />
        <div class="table">
            <a-table
                :data-source="tableData"
                :columns="columns"
                :loading="tableLoading"
                size="middle"
            >
                <template #bodyCell="{ column, text, record }">
                    <!-- 文件名称栏 -->
                    <template v-if="column.dataIndex === 'filename'">
                        <div class="editable-cell">
                            <!-- 点击保存按钮保存 -->
                            <div v-if="editableData[record.key]" class="editable-cell-input-wrapper">
                                <a-input v-model:value="editableData[record.key].filename" @pressEnter="() => saveCell(record)" />
                                <check-outlined class="editable-cell-icon-check" @click="() => saveCell(record)" />
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
                        <PlayAudioBtn class="operation-icon" :audio-url="record.url" />
                        <img class="operation-icon" @click="() => downloadAudio(record.id)" src="@/assets/download.png" alt="download icon">
                        <img class="operation-icon" @click="() => removeAudio(record.id)" src="@/assets/delete.png" alt="delete icon">
                    </template>
                </template>
            </a-table>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { CheckOutlined, EditOutlined } from '@ant-design/icons-vue';
import _ from 'lodash';
import DescTitle from '@/components/DescTitle.vue';
import PlayAudioBtn from '@/components/PlayAudioBtn.vue';
import {
    getAudioList,
    updateAudioItem,
    removeAudioItem
} from '@/api';
import i18n from '@/i18n';

type TableDataItem = {
    // 以下数据由接口返回
    key: number;
    id: string;
    filename: string;
    text: string;
    config: string;
    time: string;
    url: string;
};

// 表格栏配置
const columns = [
    {
        title: i18n.global.t('file_name'),
        dataIndex: 'filename',
        width: '25%'
    },
    {
        title: i18n.global.t('text'),
        dataIndex: 'text'
    },
    {
        title: i18n.global.t('configuration'),
        dataIndex: 'config'
    },
    {
        title: i18n.global.t('created_time'),
        dataIndex: 'time'
    },
    {
        title: i18n.global.t('operation'),
        dataIndex: 'operation'
    }
];

// 表格数据
const tableData = ref<TableDataItem[]>([]);

// 可编辑数据
const editableData = reactive({}) as any;

// 表格是否正在加载中
const tableLoading = ref(false);

// 解析后端返回的表格数据
const parseTableData = (data: TableDataItem[]) => {
    const result = [];
    for (const item of data) {
        const timeObj = new Date(item.time);
        item.time = dayjs(timeObj).format('YYYY/MM/DD');
        result.push(item);
    }
    return result;
};

// 获取表格数据
const getTableData = async () => {
    const res = await getAudioList();
    if (res.data.error === 0) {
        tableData.value = parseTableData(res.data.data.audioList as TableDataItem[]);
    } else {
        // TODO: handle msg
        console.log(res.data.msg);
    }
};

// 保存单元格
const saveCell = async (record: any) => {
    const key = record.key;
    if (editableData[key].filename.trim() === '') {
        return;
    }

    // 调用更新音频数据接口
    if (record.filename.trim() !== editableData[key].filename.trim()) {
        const updateId = record.id;
        const updateFilename = editableData[key].filename;
        setTimeout(async () => {
            tableLoading.value = true;
            await updateAudioItem({ id: updateId, filename: updateFilename });
            await getTableData();
            tableLoading.value = false;
        }, 0);
    }

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
const removeAudio = async (id: string) => {
    tableLoading.value = true;
    await removeAudioItem(id);
    await getTableData();
    tableLoading.value = false;
};

onMounted(async () => {
    try {
        // 页面刷新时，获取第一页的音频数据
        await getTableData();
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

        .operation-icon:not(:last-child) {
            width: 27px;
            height: 27px;
            margin-right: 20px;
        }

        .operation-icon:hover {
            cursor: pointer;
        }
    }
}

.editable-cell {
  position: relative;
  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}
.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
</style>
