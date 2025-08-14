<template>
  <div class="ma-content-block p-3 mt-3">
    <a-card
      :bordered="false"
      class="general-card"
      :header-style="{ paddingTop: '10px', paddingBottom: 0 }"
      :body-style="{ paddingTop: '20px' }"
      title="订单统计">
      <!-- <template #extra>
         <a-tag :color="dateType === 'day' ? 'blue' : 'green'">
          {{ dateType === 'day' ? '按日统计' : '按月统计' }}
        </a-tag> -->
      <!-- </template> --> 
      <sa-chart height="300px" :option="orderChartOptions" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { graphic } from 'echarts'
// import api from '@/api/common' // 您需要创建对应的API接口
import orderApi from '../../../order/api/order'
const props = defineProps({
  dateRange: {
    type: Array,
    default: () => []
  }
})

const xAxis = ref([])
const orderData = ref([])
const completedOrderData = ref([])
const orderChartOptions = ref({})

// 模拟数据获取函数
const getData = async () => {
  try {
    // 这里替换为您的实际API调用
    const res = await orderApi.getOrderStatistics({
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    })
    // console.log(typeof [...res.data.dateRange], 'res.data.dataRange')
    xAxis.value = [...res.data.dateRange]
    orderData.value = res.data.orderNumData
    completedOrderData.value = res.data.payOrderNumData

    // 模拟数据
    // const mockData = generateMockData()
    // xAxis.value = mockData.dates
    // orderData.value = mockData.totalOrders
    // completedOrderData.value = mockData.completedOrders
    
    updateChartOptions()
  } catch (error) {
    console.error('获取订单统计数据失败:', error)
  }
}

// 生成模拟数据
const generateMockData = () => {
  const dates = []
  const totalOrders = []
  const completedOrders = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.unshift(props.dateType === 'day' ? 
      `${date.getMonth() + 1}/${date.getDate()}` : 
      `${date.getFullYear()}/${date.getMonth() + 1}`
    )
    
    const total = Math.floor(Math.random() * 100) + 50
    const completed = Math.floor(total * (0.7 + Math.random() * 0.2))
    
    totalOrders.unshift(total)
    completedOrders.unshift(completed)
  }
  // console.log(dates, 'dates')
  // console.log(totalOrders, 'totalOrders')
  // console.log(completedOrders, 'completedOrders')


  return { dates, totalOrders, completedOrders }
}

// 更新图表配置
const updateChartOptions = () => {
  orderChartOptions.value = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['总订单', '支付订单']
    },
    xAxis: {
      type: 'category',
      data: xAxis.value,
      axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: {
      type: 'value',
      name: '订单数量',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '总订单',
        type: 'bar',
        data: orderData.value,
        itemStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      },
      {
        name: '支付订单',
        type: 'bar',
        data: completedOrderData.value,
        itemStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#25d73c' },
            { offset: 0.5, color: '#1bc23a' },
            { offset: 1, color: '#179e32' }
          ])
        }
      }
    ]
  }
}

// 监听props变化
watch(() => [props.dateType, props.dateRange], () => {
  getData()
}, { deep: true })

onMounted(() => {
  getData()
})
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