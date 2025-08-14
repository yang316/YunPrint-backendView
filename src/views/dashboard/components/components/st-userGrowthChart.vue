<template>
  <div class="ma-content-block p-3 mt-3">
    <a-card
      :bordered="false"
      class="general-card"
      :header-style="{ paddingTop: '10px', paddingBottom: 0 }"
      :body-style="{ paddingTop: '20px' }"
      title="用户增长统计">
      <sa-chart height="300px" :option="userGrowthChartOptions" />
    </a-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { graphic } from 'echarts'
import userApi from '../../../user/api/user'
const props = defineProps({
  dateRange: {
    type: Array,
    default: () => []
  }
})

const xAxis = ref([])
const newUserData = ref([])
const totalUserData = ref([])
const userGrowthChartOptions = ref({})

const getData = async () => {
  try {
    // 替换为您的实际API调用
    const res = await userApi.getUserGrowthStatistics({
      startDate: props.dateRange[0],
      endDate: props.dateRange[1]
    })
    // console.log(res)
    xAxis.value = res.data.dateRange
    newUserData.value = res.data.dailyNewUserData
    totalUserData.value = res.data.cumulativeUserData
    
    // const mockData = generateMockData()
    // xAxis.value = mockData.dates
    // newUserData.value = mockData.newUsers
    // totalUserData.value = mockData.totalUsers
    
    updateChartOptions()
  } catch (error) {
    console.error('获取用户增长数据失败:', error)
  }
}

const generateMockData = () => {
  const dates = []
  const newUsers = []
  const totalUsers = []
  let cumulativeUsers = 1000
  
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.unshift(props.dateType === 'day' ? 
      `${date.getMonth() + 1}/${date.getDate()}` : 
      `${date.getFullYear()}/${date.getMonth() + 1}`
    )
    
    const newUser = Math.floor(Math.random() * 50) + 10
    cumulativeUsers += newUser
    
    newUsers.unshift(newUser)
    totalUsers.unshift(cumulativeUsers)
  }
  
  return { dates, newUsers, totalUsers }
}

const updateChartOptions = () => {
  userGrowthChartOptions.value = {
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
      data: ['新增用户', '累计用户']
    },
    xAxis: {
      type: 'category',
      data: xAxis.value
    },
    yAxis: [
      {
        type: 'value',
        name: '新增用户',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '累计用户',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '新增用户',
        type: 'bar',
        yAxisIndex: 0,
        data: newUserData.value,
        itemStyle: {
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ffd666' },
            { offset: 0.5, color: '#ffc53d' },
            { offset: 1, color: '#faad14' }
          ])
        }
      },
      {
        name: '累计用户',
        type: 'line',
        yAxisIndex: 1,
        data: totalUserData.value,
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#722ed1'
        },
        itemStyle: {
          color: '#722ed1'
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