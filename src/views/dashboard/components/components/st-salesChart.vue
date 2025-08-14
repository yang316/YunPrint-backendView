<template>
  <div class="ma-content-block p-3 mt-3">
    <a-card
      :bordered="false"
      class="general-card"
      :header-style="{ paddingTop: '10px', paddingBottom: 0 }"
      :body-style="{ paddingTop: '20px' }"
      title="销售额统计">
      <sa-chart height="300px" :option="salesChartOptions" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { graphic } from 'echarts'
import orderApi from '../../../order/api/order'
const props = defineProps({

  dateRange: {
    type: Array,
    default: () => []
  }
})

const xAxis = ref([])
const salesData = ref([])
const salesChartOptions = ref({})

const getData = async () => {
  try {
    // 替换为您的实际API调用
    const res = await orderApi.getSalesStatistics({
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    })
    
    // const mockData = generateMockData()
    xAxis.value = res.data.dateRange
    salesData.value = res.data.sales
    
    updateChartOptions()
  } catch (error) {
    console.error('获取销售额数据失败:', error)
  }
}

const generateMockData = () => {
  const dates = []
  const sales = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.unshift(props.dateType === 'day' ? 
      `${date.getMonth() + 1}/${date.getDate()}` : 
      `${date.getFullYear()}/${date.getMonth() + 1}`
    )
    
    const sale = (Math.random() * 10000 + 5000).toFixed(2)
    sales.unshift(parseFloat(sale))
  }
  
  return { dates, sales }
}

const updateChartOptions = () => {
  salesChartOptions.value = {
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        return `<div>
          <p>${params[0].axisValueLabel}</p>
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 10px; height: 10px; background-color: ${params[0].color}; margin-right: 5px;"></span>
            <span>销售额：¥${params[0].value.toLocaleString()}</span>
          </div>
        </div>`
      }
    },
    xAxis: {
      type: 'category',
      data: xAxis.value,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '销售额（元）',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        data: salesData.value,
        smooth: true,
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: new graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ff7875' },
            { offset: 0.5, color: '#ff4d4f' },
            { offset: 1, color: '#f5222d' }
          ])
        },
        areaStyle: {
          opacity: 0.3,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 120, 117, 0.3)' },
            { offset: 1, color: 'rgba(255, 120, 117, 0)' }
          ])
        },
        itemStyle: {
          color: '#ff4d4f'
        }
      }
    ]
  }
}

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