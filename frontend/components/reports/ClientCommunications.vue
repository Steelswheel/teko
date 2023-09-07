<template>
    <div class="client-communications" v-loading="loading">
        <div class="client-communications-filters flex items-center mb-4">
            <el-tree-select
                v-model="managers"
                :data="managersData"
                multiple
                :render-after-expand="false"
                size="small"
                placeholder="Выберите менеджера"
                class="me-4"
                clearable
                show-checkbox
                collapse-tags
            />
            <ElConfigProvider :locale="locale">
                <el-date-picker
                    v-model="dates"
                    type="daterange"
                    unlink-panels
                    start-placeholder="С"
                    end-placeholder="По"
                    size="small"
                    format="DD.MM.YYYY"
                    value-format="DD.MM.YYYY"
                    clearable
                    class="me-4"
                />
            </ElConfigProvider>
            <el-checkbox
                v-model="onlyTarget"
                label="Только целевые"
                size="large"
                class="me-4"
            />
            <el-button
                @click="createExcel"
                v-if="tableData.length > 0"
                size="small"
                type="success"
                plain
                class="ms-4"
            >
                Создать Excel
            </el-button>
        </div>
        <table class="client-communications-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Итого:  {{ getCommunicationsCount }}</th>
                    <th></th>
                    <th>Итого: {{ getIncomingCallsCount }}</th>
                    <th>Итого: {{ getOutgoingCallsCount }}</th>
                    <th>Итого: {{ getIncomingMailsCount }}</th>
                    <th>Итого: {{ getOutgoingMailsCount }}</th>
                </tr>
                <tr>
                    <th>Ответственный</th>
                    <th>Компания</th>
                    <th>Целевой</th>
                    <th>Кол-во входящих звонков</th>
                    <th>Кол-во исходящих звонков</th>
                    <th>Кол-во входящих писем</th>
                    <th>Кол-во исходящих писем</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in tableData" :key="`communication-${index}`">
                    <td>
                        {{ item.manager }}
                    </td>
                    <td>
                        <template v-if="item.company_link">
                            <a class="client-communications-table-cell" :href="item.company_link">
                                {{ item.company }}
                            </a>
                        </template>
                        <template v-else>
                            {{ item.company }}
                        </template>
                    </td>
                    <td>
                        {{ item.target ? 'Да' : 'Нет' }}
                    </td>
                    <td @click="setDialog(item.incoming_calls_data)">
                        <span :class="+item.incoming_calls > 0 ? 'client-communications-table-cell' : ''">
                            {{ item.incoming_calls }}
                        </span>
                    </td>
                    <td @click="setDialog(item.outgoing_calls_data)">
                        <span :class="+item.outgoing_calls > 0 ? 'client-communications-table-cell' : ''">
                            {{ item.outgoing_calls }}
                        </span>
                    </td>
                    <td @click="setDialog(item.incoming_mails_data)">
                        <span :class="+item.incoming_mails > 0 ? 'client-communications-table-cell' : ''">
                            {{ item.incoming_mails }}
                        </span>
                    </td>
                    <td @click="setDialog(item.outgoing_mails_data)">
                        <span :class="+item.outgoing_mails > 0 ? 'client-communications-table-cell' : ''">
                            {{ item.outgoing_mails }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
        <el-dialog
            v-model="showDialog"
            title="Детализация"
            :before-close="closeDialog"
            width="fit-content"
        >
            <table class="client-communications-table">
                <thead>
                    <tr>
                        <th v-if="infoData.filter(item => item.DATE?.length > 0)?.length > 0">
                            Дата
                        </th>
                        <th v-if="infoData.filter(item => item.PHONE_NUMBER?.length > 0)?.length > 0">
                            Номер
                        </th>
                        <th v-if="infoData.filter(item => item.CALL_RECORD?.length > 0)?.length > 0">
                            Запись разговора
                        </th>
                        <th v-if="infoData.filter(item => item.EMAIL?.length > 0)?.length > 0">
                            Email
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in infoData" :key="`dialog-data-${index}`">
                        <td v-if="item.DATE">{{ item.DATE }}</td>
                        <td v-if="item.PHONE_NUMBER">{{ item.PHONE_NUMBER }}</td>
                        <td v-if="item.CALL_RECORD">
                            <audio
                                v-if="item.CALL_RECORD"
                                controls
                                :src="item.CALL_RECORD">
                                <a :href="item.CALL_RECORD">
                                    Скачать запись
                                </a>
                            </audio>
                        </td>
                        <td v-if="item.EMAIL">
                            {{ item.EMAIL }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </el-dialog>
    </div>
</template>

<script>
import { toRaw } from 'vue';
import ru from 'element-plus/dist/locale/ru.min';
import 'dayjs/locale/ru';
import { BX_POST } from '../../../API';

export default {
    name: "ClientCommunications",
    data() {
        return {
            locale: ru,
            dates: [],
            managers: [],
            managersData: [],
            tableData: [],
            onlyTarget: false,
            loading: false,
            showDialog: false,
            infoData: []
        }
    },
    methods: {
        createExcel() {
            BX_POST('pixite:reports', 'createClientCommunicationsExcel', {result: JSON.stringify(this.tableData)}).then(({ data }) => {
                if (data.data) {
                    window.open(data.data, '_blank');
                }
            }, (error) => {
                console.log(error);
            }).finally(() => this.loading = false);
        },
        setDialog(data) {
            if (data?.length > 0) {
                this.infoData = data;
                this.showDialog = true;
            }
        },
        closeDialog() {
            this.infoData = [];
            this.showDialog = false;
        },
        getManagerData() {
            this.loading = true;

            BX_POST('pixite:reports', 'getManagerData', {}).then(({ data }) => {
                this.managersData = data.data;
            }, (error) => {
                console.log(error);
            }).finally(() => this.loading = false);
        },
        getCommunications() {
            this.loading = true;

            BX_POST('pixite:reports', 'getClientCommunications', { managers_ids: this.managers, dates: this.dates, onlyTarget: this.onlyTarget }).then(({ data }) => {
               if (data.data) {
                   this.tableData = data.data;
               }
            }, (error) => {
                console.log(error);
            }).finally(() => this.loading = false);
        }
    },
    computed: {
        getCommunicationsCount() {
            return this.tableData?.length;
        },
        getIncomingCallsCount() {
            return this.tableData?.reduce((sum, current) => sum + current.incoming_calls, 0);
        },
        getOutgoingCallsCount() {
            return this.tableData?.reduce((sum, current) => sum + current.outgoing_calls, 0);
        },
        getIncomingMailsCount() {
            return this.tableData?.reduce((sum, current) => sum + current.incoming_mails, 0);
        },
        getOutgoingMailsCount() {
            return this.tableData?.reduce((sum, current) => sum + current.outgoing_mails, 0);
        }
    },
    watch: {
        managers(value) {
            const managers_ids = toRaw(value);

            if (managers_ids?.length > 0 && this.dates?.length > 0) {
                this.getCommunications();
            } else {
                this.tableData = [];
            }
        },
        dates(value) {
            const date = toRaw(value);

            if (date?.length > 0 && this.managers?.length > 0) {
                this.getCommunications();
            } else {
                this.tableData = [];
            }
        },
        onlyTarget() {
            if (this.dates?.length > 0 && this.managers?.length > 0) {
                this.getCommunications();
            } else {
                this.tableData = [];
            }
        }
    },
    mounted() {
        this.getManagerData();
    }
}
</script>

<style lang="scss">
    .client-communications {
        &-filters {
            width: fit-content;
        }

        &-table {
            border-collapse: collapse;

            &-cell {
                text-decoration: underline;
                color: #0a7ddd;
                cursor: pointer;
            }

            th, td {
                border: 1px solid black;
                vertical-align: middle;
                text-align: center;
                padding: 0.5rem;
            }
        }
    }
</style>