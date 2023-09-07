<template>
    <div class="company-communications" v-loading="loading">
        <ElConfigProvider :locale="locale">
            <div class="company-communications-filters flex items-center mb-4">
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
                <el-date-picker
                    v-if="sort === 'month'"
                    v-model="dates"
                    type="monthrange"
                    unlink-panels
                    start-placeholder="С"
                    end-placeholder="По"
                    size="small"
                    format="MM.YYYY"
                    value-format="MM.YYYY"
                    clearable
                    class="me-4"
                    style="max-width: 300px"
                />
                <el-date-picker
                    v-if="sort === 'quarter'"
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
                    style="max-width: 300px"
                />
                <el-select v-model="sort" class="m-2" placeholder="Сортировка" size="small">
                    <el-option
                        v-for="item in sortElements"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
                <el-checkbox
                    v-model="withoutNull"
                    label="Только с коммуникациями"
                    size="large"
                    class="ms-4"
                />
                <el-checkbox
                    v-model="onlyTarget"
                    label="Только целевые"
                    size="large"
                    class="ms-2"
                />
                <el-button
                    @click="createExcel"
                    class="ms-4"
                    v-if="tableData.body?.length > 0"
                    size="small"
                    type="success"
                    plain
                >
                    Создать Excel
                </el-button>
            </div>
            <table class="company-communications-table ghost-table" v-show="Object.keys(tableData).length > 0" ref="ghostTable">
                <thead>
                    <tr v-for="(row, index) in tableData.header" v-show="tableData.header?.length > 0">
                        <th
                            v-for="(col, col_index) in row"
                            :colspan="col.colspan"
                            :rowspan="col.rowspan"
                            :class="index === 0 && col_index < 5 ? `ghost-visible-col ${col.className}` : `ghost-col ${col.className ? col.className : ''}`"
                        >
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, index) in tableData.body" v-show="tableData.body?.length > 0">
                        <td
                            v-for="(col, col_index) in row"
                            :rowspan="col.rowspan"
                            :colspan="col.colspan"
                            :class="col.className?.includes('slim') || (index === 0 && col_index > 0) ? `ghost-col ${col.className ? col.className : ''}` : `ghost-visible-col ${col.className}`"
                        >
                            <template v-if="col.company_id">
                                <a
                                    :href="`/crm/company/details/${col.company_id}/`"
                                    class="company-communications-table-cell"
                                >
                                    {{ col.value }}
                                </a>
                            </template>
                            <span
                                :class="col.data?.length > 0 ? 'company-communications-table-cell' : ''"
                                @click="col.data?.length > 0 ? setDialog(col.data) : false"
                                :style="col.nowrap ? 'white-space: nowrap' : ''"
                                v-else
                            >
                                <template v-if="col.bold">
                                    <b>{{ col.value }}</b>
                                </template>
                                <template v-else>
                                    {{ col.value }}
                                </template>
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="company-communications-table-wrapper" ref="tableWrap">
                <table class="company-communications-table" ref="tableContent" v-show="Object.keys(tableData).length > 0">
                    <thead ref="tableHeader">
                        <tr v-for="row in tableData.header" v-show="tableData.header?.length > 0">
                            <th
                                v-for="col in row"
                                :colspan="col.colspan"
                                :rowspan="col.rowspan"
                                :class="col.className"
                            >
                                {{ col.label }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in tableData.body" v-show="tableData.body?.length > 0">
                            <td
                                v-for="col in row"
                                :rowspan="col.rowspan"
                                :colspan="col.colspan"
                                :class="col.className"
                            >
                                <template v-if="col.company_id">
                                    <a
                                        :href="`/crm/company/details/${col.company_id}/`"
                                        class="company-communications-table-cell"
                                    >
                                        {{ col.value }}
                                    </a>
                                </template>
                                <span
                                    :class="col.data?.length > 0 ? 'company-communications-table-cell' : ''"
                                    @click="col.data?.length > 0 ? setDialog(col.data) : false"
                                    :style="col.nowrap ? 'white-space: nowrap' : ''"
                                    v-else
                                >
                                    <template v-if="col.bold">
                                        <b>{{ col.value }}</b>
                                    </template>
                                    <template v-else>
                                        {{ col.value }}
                                    </template>
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div ref="bottomPanel" class="company-communications-bottom-panel">
                <div class="company-communications-double-scroll">
                    <div class="company-communications-double-scroll-scroll"></div>
                </div>
            </div>
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
        </ElConfigProvider>
    </div>
</template>

<script>
import ru from 'element-plus/dist/locale/ru.min';
import 'dayjs/locale/ru';
import { BX_POST } from '../../../API';
import { toRaw } from 'vue';

export default {
    name: "CompanyCommunications",
    data() {
        return {
            locale: ru,
            managersData: [],
            managers: [],
            dates: [],
            tableData: {},
            onlyTarget: false,
            withoutNull: false,
            loading: false,
            showDialog: false,
            infoData: [],
            sort: 'month',
            sortElements: [
                {
                    value: 'month',
                    label: 'Месяц'
                },
                {
                    value: 'quarter',
                    label: 'Квартал'
                }
            ]
        }
    },
    methods: {
        setGhostTable() {
            setTimeout(() => {
                let ghostTable = this.$refs.ghostTable;
                let tableContent = this.$refs.tableContent;

                if (ghostTable) {
                    let first_row = tableContent?.querySelector('tbody')?.querySelector('tr')?.querySelector('td');
                    let header = tableContent?.querySelector('thead')?.querySelector('tr')?.querySelector('th');

                    if (first_row && header) {
                        ghostTable.style.width = first_row.offsetWidth + 'px';

                        ghostTable.querySelectorAll('th').forEach(th => th.style.height = header.offsetHeight + 'px');

                        let ghostCols = ghostTable.querySelectorAll('.ghost-col');

                        if (ghostCols) {
                            ghostCols.forEach(col => col.style.display = 'none');
                        }
                    }
                }
            }, 0);
        },
        createExcel() {
            BX_POST('pixite:reports', 'createCompanyCommunicationsExcel', {result: JSON.stringify(this.tableData)}).then(({ data }) => {
                if (data.data) {
                    window.open(data.data, '_blank');
                }
            }, (error) => {
                console.log(error);
            }).finally(() => this.loading = false);
        },
        scroll() {
            const elWrap = this.$refs.tableWrap
            const doubleWrap = this.$el.querySelector('.company-communications-double-scroll');
            const bottomPanel = this.$refs.bottomPanel;

            const eventScroll = () => {
                const cor = elWrap.getBoundingClientRect();
                const h = elWrap.offsetHeight;
                const isShowScroll = (cor.top + h - window.innerHeight > 0) && (cor.y - h + 200 < 0);

                if (isShowScroll) {
                    if (doubleWrap.style.display !== 'block') {
                        bottomPanel.style.display = 'block';
                    }
                } else {
                    if (doubleWrap.style.display !== 'none') {
                        bottomPanel.style.display = 'none';
                    }
                }

                this.updateScrollBar();
            }

            eventScroll();

            window.addEventListener('scroll', eventScroll);

            window.addEventListener('resize', () => {
                this.updateScrollBar();
            });

            doubleWrap.addEventListener('scroll', function() {
                elWrap.scrollLeft = doubleWrap.scrollLeft;
            });
        },
        updateScrollBar() {
            const elWrap = this.$refs.tableWrap;
            const elScroll = this.$refs.tableContent;
            const doubleWrap = this.$el.querySelector('.company-communications-double-scroll');
            const doubleScroll = this.$el.querySelector('.company-communications-double-scroll-scroll');

            if (elWrap) {
                let corElWrap = elWrap.getBoundingClientRect();

                if (corElWrap && doubleWrap) {
                    doubleWrap.style.left = `${corElWrap.x}px`;
                }

                if (doubleWrap) {
                    doubleWrap.style.width = `${elWrap.clientWidth}px`;
                    doubleWrap.scrollLeft = elWrap.scrollLeft;
                }
            }

            if (doubleScroll && elScroll) {
                doubleScroll.style.width = `${elScroll.clientWidth}px`;
            }
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

            BX_POST('pixite:reports', 'getCompanyCommunications', { managers_ids: this.managers, dates: this.dates, sort: this.sort, withoutNull: this.withoutNull, onlyTarget: this.onlyTarget }).then(({ data }) => {
                if (data.data) {
                    this.tableData = data.data;
                    this.setGhostTable();
                }
            }, (error) => {
                console.log(error);
            }).finally(() => this.loading = false);
        },
        fixPositionSticky(elHeader, boxShadow = 'rgb(0 0 0) 0px 9px 16px -16px', offset = 0) {
            const eventScroll = () => {
                if (elHeader) {
                    const elWrap = elHeader.parentNode;

                    if (elWrap) {
                        const cor = elWrap.getBoundingClientRect();

                        if (cor.y < 0) {
                            elHeader.style.top = `${offset ? -cor.y + offset : -cor.y}px`;
                            elHeader.style.boxShadow = boxShadow;
                            elHeader.style.zIndex = 1000;
                        } else {
                            elHeader.style.top = `0px`;
                            elHeader.style.boxShadow = ``;
                            elHeader.style.zIndex = 0;
                        }
                    }
                }
            }

            window.removeEventListener('scroll', eventScroll);
            window.addEventListener('scroll', eventScroll);
        }
    },
    watch: {
        tableData: {
            deep: true,
            handler() {
                this.fixPositionSticky(this.$refs.tableHeader);
                this.scroll();
                this.updateScrollBar();
            }
        },
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
        withoutNull() {
            if (this.dates?.length > 0 && this.managers?.length > 0) {
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
        },
        sort() {
            this.tableData = {};
            this.dates = [];
        }
    },
    mounted() {
        this.getManagerData();
    }
}
</script>

<style lang="scss" scoped>
    .company-communications {
        position: relative;

        &-bottom-panel {
            position: fixed;
            display: none;
            z-index: 999;
            bottom: 0;
        }

        &-double-scroll {
            overflow-x: auto;
            width: 50px;

            &-scroll {
                min-height: 1px;
            }
        }

        &-table {
            border-collapse: collapse;
            width: 100%;

            thead {
                position: sticky;
                border: 1px solid black;
            }

            &-wrapper {
                overflow-y: auto;
                position: relative;
            }

            th {
                background-color: #FFF;
            }

            th, td {
                border: 1px solid black;
                text-align: center;
                padding: 3px;
            }

            &-cell {
                text-decoration: underline;
                color: #0a7ddd;
                cursor: pointer;

                &-slim {
                    width: 100px!important;
                    min-width: unset!important;
                }

                &-grey {
                    background-color: #D2D2D2!important;

                    & > * {
                        background-color: #D2D2D2!important;
                    }
                }
            }
        }
    }

    a.company-communications-table-cell {
        z-index: 0;
    }

    .ghost {
        &-table {
            position: absolute;
            left: 0;
            z-index: 997;

            tbody {
                background-color: rgba(255, 255, 255, 1);
            }
        }

        &-visible-col {
            position: relative;
            z-index: 999;
        }

        &-col {
            border: 1px solid transparent!important;
        }
    }
</style>