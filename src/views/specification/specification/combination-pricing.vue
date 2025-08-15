<template>
  <div class="ma-content-block">
    <!-- 规格选择区域 -->
    <a-card title="规格组合选择" class="mb-4">
      <a-row :gutter="16">
        <a-col v-for="spec in specList" :key="spec.id" :span="6">
          <a-form-item :label="spec.name">
            <a-select 
              v-model="selectedSpecs[spec.id]" 
              placeholder="请选择" 
              allow-clear
              @change="onSpecChange"
            >
              <a-option 
                v-for="value in spec.values" 
                :key="value.id" 
                :value="value.id"
                :label="value.name"
              >
                {{ value.name }} (¥{{ value.base_price }})
              </a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      
      <!-- 当前组合价格显示 -->
      <div class="current-price-display">
        <a-alert 
          v-if="currentCombination.length > 0" 
          :message="`当前选择: ${currentCombinationText}`" 
          :description="`基础价格: ¥${currentBasePrice} | 组合价格: ¥${currentPrice}`"
          type="info" 
          show-icon 
        />
      </div>
    </a-card>

    <!-- 价格设置表格 -->
    <a-card title="规格组合价格设置">
      <template #extra>
        <a-space>
          <a-button type="primary" @click="generateCombinations">
            <template #icon><icon-refresh /></template>
            生成所有组合
          </a-button>
          <a-button type="primary" @click="batchSetPrice">
            <template #icon><icon-edit /></template>
            批量设价
          </a-button>
          <a-button @click="savePrices" :loading="saving">
            <template #icon><icon-save /></template>
            保存价格
          </a-button>
        </a-space>
      </template>
      
      <a-table 
        :data="combinationPrices" 
        :pagination="{ pageSize: 20 }"
        :scroll="{ x: 1000 }"
      >
        <a-table-column title="规格组合" data-index="combination_text" width="300" fixed="left">
          <template #cell="{ record }">
            <div class="combination-display">
              <a-tag 
                v-for="(spec, index) in record.combination_display" 
                :key="index" 
                :color="getTagColor(index)"
                class="mb-1"
              >
                {{ spec.spec_name }}: {{ spec.value_name }}
              </a-tag>
            </div>
          </template>
        </a-table-column>
        
        <a-table-column title="基础价格" data-index="base_price" width="120">
          <template #cell="{ record }">
            <span>¥{{ record.base_price.toFixed(2) }}</span>
          </template>
        </a-table-column>
        
        <a-table-column title="组合价格" data-index="combination_price" width="150">
          <template #cell="{ record, rowIndex }">
            <a-input-number 
              v-model="record.combination_price" 
              :min="0" 
              :precision="2" 
              placeholder="设置价格"
              @change="onPriceChange(record, rowIndex)"
            >
              <template #prefix>¥</template>
            </a-input-number>
          </template>
        </a-table-column>
        
        <a-table-column title="价格差异" data-index="price_diff" width="120">
          <template #cell="{ record }">
            <span :class="getPriceDiffClass(record.price_diff)">
              {{ record.price_diff > 0 ? '+' : '' }}¥{{ record.price_diff.toFixed(2) }}
            </span>
          </template>
        </a-table-column>
        
        <a-table-column title="状态" data-index="status" width="100">
          <template #cell="{ record }">
            <a-switch 
              v-model="record.status" 
              :checked-value="1" 
              :unchecked-value="0"
            />
          </template>
        </a-table-column>
        
        <a-table-column title="操作" width="120" fixed="right">
          <template #cell="{ record, rowIndex }">
            <a-space>
              <a-button type="text" size="small" @click="copyPrice(record)">
                复制价格
              </a-button>
              <a-button type="text" size="small" status="danger" @click="resetPrice(record, rowIndex)">
                重置
              </a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-card>

    <!-- 批量设价弹窗 -->
    <a-modal v-model:visible="batchPriceVisible" title="批量设置价格" width="500px">
      <a-form :model="batchPriceForm" layout="vertical">
        <a-form-item label="价格设置方式">
          <a-radio-group v-model="batchPriceForm.type">
            <a-radio value="fixed">固定价格</a-radio>
            <a-radio value="add">基础价格+增量</a-radio>
            <a-radio value="multiply">基础价格×倍数</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item v-if="batchPriceForm.type === 'fixed'" label="固定价格">
          <a-input-number v-model="batchPriceForm.value" :min="0" :precision="2" placeholder="输入固定价格">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        
        <a-form-item v-if="batchPriceForm.type === 'add'" label="价格增量">
          <a-input-number v-model="batchPriceForm.value" :precision="2" placeholder="输入价格增量">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
        
        <a-form-item v-if="batchPriceForm.type === 'multiply'" label="价格倍数">
          <a-input-number v-model="batchPriceForm.value" :min="0" :precision="2" placeholder="输入价格倍数" />
        </a-form-item>
      </a-form>
      
      <template #footer>
        <a-space>
          <a-button @click="batchPriceVisible = false">取消</a-button>
          <a-button type="primary" @click="applyBatchPrice">应用</a-button>
        </a-space>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconRefresh, IconEdit, IconSave } from '@arco-design/web-vue/es/icon'
import api from '../api/specification'

// 模拟数据
const mockSpecData = {
  specs: [
    {
      id: 1,
      name: '纸张类型',
      status: '1',
      values: [
        { id: 1, name: '普通纸', base_price: 0.10, status: '1' },
        { id: 2, name: '铜版纸', base_price: 0.15, status: '1' },
        { id: 3, name: '哑粉纸', base_price: 0.18, status: '1' },
        { id: 4, name: '艺术纸', base_price: 0.25, status: '1' }
      ]
    },
    {
      id: 2,
      name: '打印颜色',
      status: '1',
      values: [
        { id: 5, name: '黑白', base_price: 0.05, status: '1' },
        { id: 6, name: '彩色', base_price: 0.20, status: '1' },
        { id: 7, name: '专色', base_price: 0.35, status: '1' }
      ]
    },
    {
      id: 3,
      name: '纸张尺寸',
      status: '1',
      values: [
        { id: 8, name: 'A4', base_price: 0.00, status: '1' },
        { id: 9, name: 'A3', base_price: 0.10, status: '1' },
        { id: 10, name: 'A5', base_price: -0.05, status: '1' },
        { id: 11, name: '自定义', base_price: 0.15, status: '1' }
      ]
    },
    {
      id: 4,
      name: '装订方式',
      status: '1',
      values: [
        { id: 12, name: '无装订', base_price: 0.00, status: '1' },
        { id: 13, name: '骑马钉', base_price: 0.08, status: '1' },
        { id: 14, name: '胶装', base_price: 0.15, status: '1' },
        { id: 15, name: '精装', base_price: 0.30, status: '1' }
      ]
    }
  ]
}

// 数据定义
const specList = ref([])
const selectedSpecs = ref({})
const combinationPrices = ref([])
const saving = ref(false)
const batchPriceVisible = ref(false)
const copiedPrice = ref(0)

// 批量设价表单
const batchPriceForm = reactive({
  type: 'fixed',
  value: 0
})

// 当前选择的规格组合
const currentCombination = computed(() => {
  return Object.entries(selectedSpecs.value)
    .filter(([specId, valueId]) => valueId)
    .map(([specId, valueId]) => {
      const spec = specList.value.find(s => s.id == specId)
      const value = spec?.values.find(v => v.id == valueId)
      return {
        spec_id: specId,
        spec_name: spec?.name,
        value_id: valueId,
        value_name: value?.name,
        value_price: value?.base_price || 0
      }
    })
})

// 当前组合文本显示
const currentCombinationText = computed(() => {
  return currentCombination.value
    .map(item => `${item.spec_name}: ${item.value_name}`)
    .join(' + ')
})

// 当前基础价格
const currentBasePrice = computed(() => {
  return currentCombination.value.reduce((sum, item) => sum + item.value_price, 0).toFixed(2)
})

// 当前组合价格
const currentPrice = computed(() => {
  const basePrice = currentCombination.value.reduce((sum, item) => sum + item.value_price, 0)
  const combination = combinationPrices.value.find(cp => 
    cp.combination.length === currentCombination.value.length &&
    cp.combination.every(c => 
      currentCombination.value.some(cc => 
        cc.spec_id == c.spec_id && cc.value_id == c.value_id
      )
    )
  )
  return (combination?.combination_price || basePrice).toFixed(2)
})

// 获取标签颜色
const getTagColor = (index) => {
  const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan']
  return colors[index % colors.length]
}

// 获取价格差异样式
const getPriceDiffClass = (diff) => {
  if (diff > 0) return 'text-red-500'
  if (diff < 0) return 'text-green-500'
  return 'text-gray-500'
}

// 规格变化处理
const onSpecChange = async () => {
  // 注释掉API请求，使用模拟数据
  // if (currentCombination.value.length > 0) {
  //   try {
  //     const response = await api.getPriceBySpecs(currentCombination.value)
  //     if (response.code === 200) {
  //       // 可以在这里处理实时价格查询结果
  //     }
  //   } catch (error) {
  //     console.error('获取价格失败:', error)
  //   }
  // }
  
  // 使用模拟数据进行价格计算
  if (currentCombination.value.length > 0) {
    console.log('当前选择的规格组合:', currentCombination.value)
    console.log('基础价格:', currentBasePrice.value)
  }
}

// 生成所有规格组合
const generateCombinations = () => {
  if (specList.value.length === 0) {
    Message.warning('请先添加规格')
    return
  }
  
  const combinations = []
  
  // 生成笛卡尔积组合
  const generateCartesian = (specs, current = [], index = 0) => {
    if (index === specs.length) {
      if (current.length > 0) {
        combinations.push([...current])
      }
      return
    }
    
    const spec = specs[index]
    for (const value of spec.values) {
      if (value.status === '1') { // 只包含启用的规格值
        current.push({
          spec_id: spec.id,
          spec_name: spec.name,
          value_id: value.id,
          value_name: value.name,
          value_price: value.base_price || 0
        })
        generateCartesian(specs, current, index + 1)
        current.pop()
      }
    }
  }
  
  generateCartesian(specList.value.filter(s => s.status === '1'))
  
  // 转换为价格设置格式
  combinationPrices.value = combinations.map((combination, index) => {
    const basePrice = combination.reduce((sum, item) => sum + item.value_price, 0)
    const combinationText = combination.map(item => `${item.spec_name}: ${item.value_name}`).join(' + ')
    
    // 为一些组合设置优惠价格作为示例
    let combinationPrice = basePrice
    if (index % 3 === 0) {
      combinationPrice = Math.round(basePrice * 0.9 * 100) / 100 // 9折优惠
    } else if (index % 5 === 0) {
      combinationPrice = Math.round(basePrice * 0.85 * 100) / 100 // 8.5折优惠
    }
    
    return {
      combination,
      combination_display: combination,
      combination_text: combinationText,
      base_price: Math.round(basePrice * 100) / 100,
      combination_price: Math.round(combinationPrice * 100) / 100,
      price_diff: Math.round((combinationPrice - basePrice) * 100) / 100,
      status: 1
    }
  })
  
  Message.success(`生成了 ${combinations.length} 个规格组合`)
}

// 价格变化处理
const onPriceChange = (record, index) => {
  record.price_diff = record.combination_price - record.base_price
}

// 批量设价
const batchSetPrice = () => {
  if (combinationPrices.value.length === 0) {
    Message.warning('请先生成规格组合')
    return
  }
  batchPriceVisible.value = true
}

// 应用批量设价
const applyBatchPrice = () => {
  combinationPrices.value.forEach(record => {
    switch (batchPriceForm.type) {
      case 'fixed':
        record.combination_price = batchPriceForm.value
        break
      case 'add':
        record.combination_price = record.base_price + batchPriceForm.value
        break
      case 'multiply':
        record.combination_price = record.base_price * batchPriceForm.value
        break
    }
    record.price_diff = record.combination_price - record.base_price
  })
  
  batchPriceVisible.value = false
  Message.success('批量设价完成')
}

// 复制价格
const copyPrice = (record) => {
  copiedPrice.value = record.combination_price
  Message.success(`已复制价格: ¥${copiedPrice.value.toFixed(2)}`)
}

// 重置价格
const resetPrice = (record, index) => {
  record.combination_price = record.base_price
  record.price_diff = 0
}

// 保存价格设置
const savePrices = async () => {
  if (combinationPrices.value.length === 0) {
    Message.warning('没有可保存的价格设置')
    return
  }
  
  saving.value = true
  try {
    // 注释掉API请求，使用模拟保存
    // const response = await api.saveCombinationPrices({
    //   combinations: combinationPrices.value
    // })
    
    // 模拟保存成功
    await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟网络延迟
    console.log('保存的价格数据:', combinationPrices.value)
    Message.success('价格设置保存成功（模拟）')
  } catch (error) {
    Message.error('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 加载规格列表
const loadSpecs = async () => {
  try {
    // 注释掉API请求，使用模拟数据
    // const response = await api.getAllSpecs()
    // if (response.code === 200) {
    //   specList.value = response.data.specs
    // }
    
    // 使用模拟数据
    specList.value = mockSpecData.specs
    Message.success('规格数据加载成功（模拟数据）')
  } catch (error) {
    Message.error('加载规格失败: ' + error.message)
  }
}

// 加载已有的组合价格
const loadCombinationPrices = async () => {
  try {
    // 注释掉API请求
    // const response = await api.getCombinationPrices()
    // if (response.code === 200) {
    //   combinationPrices.value = response.data
    // }
    
    // 使用空数组，等待用户生成组合
    combinationPrices.value = []
  } catch (error) {
    console.error('加载组合价格失败:', error)
  }
}

// 页面初始化
onMounted(async () => {
  await loadSpecs()
  await loadCombinationPrices()
  
  // 自动生成组合数据以便查看效果
  setTimeout(() => {
    if (specList.value.length > 0) {
      generateCombinations()
    }
  }, 500)
})
</script>

<style scoped>
.current-price-display {
  margin-top: 16px;
}

.combination-display {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.mb-1 {
  margin-bottom: 4px;
}

.mb-4 {
  margin-bottom: 16px;
}

.text-red-500 {
  color: #ef4444;
}

.text-green-500 {
  color: #10b981;
}

.text-gray-500 {
  color: #6b7280;
}
</style>