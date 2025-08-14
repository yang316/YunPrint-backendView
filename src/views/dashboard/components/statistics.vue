<template>
  <div>
    <!-- 日期筛选器 -->
    <div class="ma-content-block p-3">
      <a-card :bordered="false" class="general-card">
        <div class="flex items-center space-x-4">
          <span class="text-gray-600">统计周期：</span>
          <!-- <a-radio-group v-model="dateType" @change="handleDateTypeChange">
            <a-radio value="day">按日</a-radio>
            <a-radio value="month">按月</a-radio>
          </a-radio-group> -->
          <a-range-picker v-model="dateRange" @change="handleDateRangeChange" style="width: 300px" />
          <a-button type="primary" @click="refreshData">刷新数据</a-button>
        </div>
      </a-card>
    </div>

    <!-- <st-welcome />
    <st-count />
    <st-login-chart /> -->

    <!-- 新增统计图表 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <st-order-chart :date-range="dateRange" />
      <st-user-growth-chart :date-range="dateRange" />
      <st-sales-chart :date-range="dateRange" />
      <st-commission-chart :date-range="dateRange" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// import StCount from './components/st-count.vue'
// import StWelcome from './components/st-welcome.vue'
// import StLoginChart from './components/st-loginChart.vue'
import StOrderChart from './components/st-orderChart.vue'
import StUserGrowthChart from './components/st-userGrowthChart.vue'
import StSalesChart from './components/st-salesChart.vue'
import StCommissionChart from './components/st-commissionChart.vue'


// 日期范围
const dateRange = ref([])


// 处理日期范围变化
const handleDateRangeChange = () => {
  refreshData()
}

// 刷新数据
const refreshData = () => {
  // 这里可以触发子组件刷新数据的事件
  console.log('刷新数据', { dateRange: dateRange.value })

}
</script>

<style lang="less" scoped>
.general-card {
  border-radius: 4px;
  border: none;

  :deep(.arco-card-header) {
    height: auto;
    padding: 20px;
    border: none;
  }
}
</style>
