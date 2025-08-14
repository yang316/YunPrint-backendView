<template>
  <div class="ma-content-block p-3 mt-3">
    <a-card
      :bordered="false"
      class="general-card"
      :header-style="{ paddingTop: '10px', paddingBottom: 0 }"
      :body-style="{ paddingTop: '20px' }"
      title="佣金支出统计">
      <sa-chart height="300px" :option="commissionChartOptions" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { graphic } from 'echarts'
import amountApi from '../../../AmountLog/api/log'
const props = defineProps({
  dateRange: {
    type: Array,
    default: () => []
  }
})

const xAxis = ref([])
const commissionData = ref([])
const commissionChartOptions = ref({})

const getData = async () => {
  try {
    // 替换为您的实际API调用
    const res = await amountApi.getCommissionStatistics({
      // dateType: props.dateType,
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    })
     xAxis.value = res.data.dateRange
     commissionData.value = res.data.dailyAmountData
    
    // const mockData = generateMockData()
    // xAxis.value = mockData.dates
    // commissionData.value = mockData.commissions
    
    updateChartOptions()
  } catch (error) {
    console.error('获取佣金支出数据失败:', error)
  }
}

const generateMockData = () => {
  const dates = []
  const commissions = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.unshift(props.dateType === 'day' ? 
      `${date.getMonth() + 1}/${date.getDate()}` : 
      `${date.getFullYear()}/${date.getMonth() + 1}`
    )
    
    const commission = (Math.random() * 2000 + 500).toFixed(2)
    commissions.unshift(parseFloat(commission))
  }
  
  return { dates, commissions }
}

const updateChartOptions = () => {
  commissionChartOptions.value = {
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
            <span>佣金支出：¥${params[0].value.toLocaleString()}</span>
          </div>
        </div>`
      }
    },
    xAxis: {
      type: 'category',
      data: xAxis.value
    },
    yAxis: {
      type: 'value',
      name: '佣金支出（元）',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '佣金支出',
        type: 'bar',
        data: commissionData.value,
        itemStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#b37feb' },
            { offset: 0.5, color: '#9254de' },
            { offset: 1, color: '#722ed1' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#d3adf7' },
              { offset: 0.5, color: '#b37feb' },
              { offset: 1, color: '#9254de' }
            ])
          }
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