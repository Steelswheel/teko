<template>
    <div class="company-filter-tab" v-loading="loading">
        <ElConfigProvider :locale="locale">
            <div class="filter mb-4">
                <el-select
                    v-model="requisites"
                    class="m-2"
                    placeholder="Реквизиты"
                    size="small"
                    multiple
                >
                    <el-option
                        v-for="item in filterData"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
            </div>
            <div class="content"></div>
        </ElConfigProvider>
    </div>
</template>

<script>
import ru from 'element-plus/dist/locale/ru.min';
import 'dayjs/locale/ru';
import { BX_POST } from '../../../API';

export default {
    name: "CompanyCommunications",
    data() {
        return {
            locale: ru,
            requisites: [],
            filterData: [],
            contactsData: []
        }
    },
    methods: {},
    mounted() {
        this.getManagerData();
    }
}
</script>

<style lang="scss" scoped>

</style>