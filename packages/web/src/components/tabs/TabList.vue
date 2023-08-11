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
                                <a-input v-model:value="editableData[record.key].filename" @pressEnter="() => saveCell(record)" maxLength="50" />
                                <check-outlined class="editable-cell-icon-check" @click="() => saveCell(record)" />
                            </div>

                            <!-- 点击编辑按钮进入编辑模式 -->
                            <div v-else class="editable-cell-text-wrapper">
                                <span>{{ text || ' ' }}</span>
                                <edit-outlined class="editable-cell-icon" @click="() => editCell(record.key)" />
                            </div>
                        </div>
                    </template>

                    <!-- 操作栏 -->
                    <template v-else-if="column.dataIndex === 'operation'">
                        <PlayAudioBtn class="operation-icon" :audio-url="record.url" />
                        <img class="operation-icon" @click="() => downloadAudio(record.id)" src="@/assets/download.png" alt="download icon">
                        <img class="operation-icon" @click="() => openModal(record.id)" src="@/assets/delete.png" alt="delete icon">
                    </template>
                </template>
            </a-table>
        </div>

        <!-- 删除音频提示弹框 -->
        <a-modal v-model:visible="modalVisible" :closable="false" width="420px" centered class="Modal">
            <template #title>
                <div class="Modal-title-wrap">
                    <ExclamationCircleFilled class="Modal-title-icon" />
                </div>
            </template>

            <div class="dismiss-content">
                <div class="tip-message">{{ $t('this_audio_will_not_be_avail_confirm_to_proceed') }}</div>
            </div>

            <template #footer>
                <div class="Modal-button-group">
                    <a-button @click="closeModal">{{ $t('cancel') }}</a-button>
                    <a-button type="primary" @click="removeAudio">{{ $t('done') }}</a-button>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import {
    CheckOutlined,
    EditOutlined,
    ExclamationCircleFilled
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import _ from 'lodash';
import DescTitle from '@/components/DescTitle.vue';
import PlayAudioBtn from '@/components/PlayAudioBtn.vue';
import {
    getAudioList,
    updateAudioItem,
    removeAudioItem,
    SERVER_PORT
} from '@/api';
import i18n from '@/i18n';

type TableDataItem = {
    // 接口返回数据
    key: number;
    id: string;
    filename: string;
    text: string;
    config: string;
    time: string;
    downloadUrl: string;

    // 拼装数据
    url: string;
};

// 表格栏配置
const columns = [
    {
        title: i18n.global.t('file_name'),
        dataIndex: 'filename',
        width: 180
    },
    {
        title: i18n.global.t('text'),
        dataIndex: 'text',
        ellipsis: true,
    },
    {
        title: i18n.global.t('configuration'),
        dataIndex: 'config',
        ellipsis: true,
        width: 145
    },
    {
        title: i18n.global.t('created_time'),
        dataIndex: 'time',
        width: 110
    },
    {
        title: i18n.global.t('operation'),
        dataIndex: 'operation',
        width: 140
    }
];

// 表格数据
const tableData = ref<TableDataItem[]>([]);

// 可编辑数据
const editableData = reactive({}) as any;

// 表格是否正在加载中
const tableLoading = ref(false);

// 删除音频弹框是否可见
const modalVisible = ref(false);

// 被删除音频文件 ID
const removeAudioId = ref('');

// 解析语言
const parseLang = (lang: string) => {
    let result = '';

    switch (lang) {
        case 'en-US': result = i18n.global.t('american_english');   break;
        case 'en-GB': result = i18n.global.t('british_english');    break;
        case 'de-DE': result = i18n.global.t('german_germany');     break;
        case 'es-ES': result = i18n.global.t('european_spanish');   break;
        case 'fr-FR': result = i18n.global.t('french_france');      break;
        case 'it-IT': result = i18n.global.t('italian_italy');      break;
        default: break;
    }

    return result;
};

// 解析后端返回的表格数据
const parseTableData = (data: TableDataItem[]) => {
    const result = [];
    for (const item of data) {
        const timeObj = new Date(item.time);
        item.time = dayjs(timeObj).format('YYYY/MM/DD');
        item.url = `http://${location.hostname}:${SERVER_PORT}/${item.downloadUrl}`;
        item.config = parseLang(item.config);
        result.push(item);
    }
    return result;
};

// 获取表格数据
const getTableData = async () => {
    try {
        const res = await getAudioList();
        if (res.data.error === 0) {
            tableData.value = parseTableData(res.data.data.audioList as TableDataItem[]);
        } else {
            message.error(res.data.msg);
            console.error(`getAudioList(): ${res.data.msg}`);
        }
    } catch (err: any) {
        const errContent = `${err.name}: ${err.message}`;
        message.error(errContent);
        console.error(`getAudioList(): ${errContent}`);
    }
};

// 保存单元格
const saveCell = async (record: any) => {
    const key = record.key;
    if (editableData[key].filename.trim() === '') {
        message.error(i18n.global.t('filename_empty'));
        return;
    }

    // 调用更新音频数据接口
    if (record.filename.trim() !== editableData[key].filename.trim()) {
        const updateId = record.id;
        const updateFilename = editableData[key].filename;
        setTimeout(async () => {
            tableLoading.value = true;
            try {
                await updateAudioItem({ id: updateId, filename: updateFilename.replace(/\s*/g, '') });
                await getTableData();
            } catch (err: any) {
                const errContent = `${err.name}: ${err.message}`;
                message.error(errContent);
                console.error(`saveCell(): ${errContent}`);
            }
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

const closeModal = () => {
    modalVisible.value = false;
};

const openModal = (id: string) => {
    removeAudioId.value = id;
    modalVisible.value = true;
};

// 删除音频文件
const removeAudio = async () => {
    tableLoading.value = true;
    try {
        await removeAudioItem(removeAudioId.value);
        await getTableData();
    } catch (err: any) {
        const errContent = `${err.name}: ${err.message}`;
        message.error(errContent);
        console.error(`removeAudio: ${errContent}`)
    }
    tableLoading.value = false;
    closeModal();
};

onMounted(async () => {
    try {
        // 页面刷新时，获取第一页的音频数据
        await getTableData();
    } catch (err: any) {
        const errContent = `${err.name}: ${err.message}`;
        message.error(errContent);
        console.error(`onMounted: getTableData(): ${errContent}`);
    }
});
</script>

<style lang="scss" scoped>
.tab-list {
    .table {
        padding: 0 8px;

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
    padding: 5px 24px 0 0;
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

.editable-cell-text-wrapper span {
    width: 100%;
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
</style>

<style lang="scss">
/* -------------------------------->8-------------------------------- */
// 自定义弹框样式
.Modal {

    .Modal-title-wrap {
        display: flex;
        justify-content: center;

        .Modal-title {
            font-weight: 600;
            font-size: 20px;
            color: #424242;
        }

        .Modal-title-icon {
            color: #F2CB51;
            font-size: 76px;
            margin-top: 24px;
        }

        .Modal-title-icon-success {
            color: #20b759;
            font-size: 76px;
        }
    }



    .Modal-content {
        font-size: 16px;
        font-weight: bold;
        color: #424242;
        text-align: center;
    }

    .Modal-button-group {
        display: flex;
        justify-content: center;
        gap: 58px;

        .ant-btn {
            width: 120px;
            height: 40px;
            border-radius: 4px;
            font-size: 16px;
        }
    }

    .ant-modal-close-x {
        width: 70px;
        font-size: 23px;
    }

    //ant-modal弹框定制

    .ant-modal-content {
        border-radius: 8px;
    }

    .ant-modal-body {
        padding: 24px;
        max-height: 660px;
        overflow-y: auto;
    }

    .ant-modal-header {
        border-bottom: none;
        border-radius: 8px;
        padding-bottom: 0;
    }

    .ant-modal-footer {
        border-top: none;
        padding:0 16px 20px;
    }


    .ant-modal-body::-webkit-scrollbar {
        /*滚动条整体样式*/
        width: 8px;
        /*高宽分别对应横竖滚动条的尺寸*/
        height: 8px;
    }

    .ant-modal-body::-webkit-scrollbar-thumb {
        /*滚动条里面小方块*/
        border-radius: 5px;
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
        background: rgba(0, 0, 0, 0.1);
    }

    .ant-modal-body::-webkit-scrollbar-track {
        /*滚动条里面轨道*/
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
        border-radius: 0;
        background: rgba(0, 0, 0, 0.1);
    }
}

.ant-modal-content {
    border-radius: 8px;
}

//docker固件升级的弹窗样式
.update-comp-modal{
    .ant-modal-content{
        border-radius: 4px;
        overflow: hidden;
    }
   .ant-modal-body{
        padding: 0;
    }

    .ant-modal-header{
        padding: 0;
    }

    .ant-modal-footer{
        padding: 0;
    }


}

.addModal{
    .ant-modal-body {
        max-height: 535px!important;
    }
}

.add-volume-modal{
    .ant-modal-body {
        padding:0 24px!important;
    }
}
</style>
