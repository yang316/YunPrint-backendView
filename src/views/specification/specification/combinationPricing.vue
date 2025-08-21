<template>
  <a-modal :visible="visible" title="规格组合定价" width="1200px" @ok="saveCombinationPricing" @cancel="handleCancel">
    <div class="combination-pricing-content">
      <!-- 组合价格表格 -->
      <a-table :data="combinationList" :pagination="false" :row-selection="{
        type: 'checkbox',
        showCheckedAll: true,
        onlyCurrent: false,
        // selectedRowKeys: selectedRowKeys,
      }" v-model:selectedKeys="selectedRowKeys" row-key="id">
        <template #columns>
          <div class="batch-operations"
            style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
            <h4 style="margin-bottom: 12px;">批量操作</h4>
            <a-space wrap>
              <a-input-number v-model="batchPrice" :min="0" :precision="2" placeholder="批量价格" style="width: 150px;">
                <template #prefix>¥</template>
              </a-input-number>
              <a-button @click="batchSetPrice"
                :disabled="!batchPrice || batchPrice <= 0 || selectedRowKeys.length === 0">
                批量设置价格
              </a-button>
              <a-button @click="batchResetPrice" :disabled="selectedRowKeys.length === 0">
                批量重置价格
              </a-button>
              <!-- <a-button @click="selectAllCombinations" v-if="!isAllSelected">
                全选
              </a-button>
              <a-button @click="clearSelection" v-else>
                取消全选
              </a-button> -->
            </a-space>
            <div style="margin-top: 8px; color: #666; font-size: 12px;">
              已选择 {{ selectedRowKeys.length }} 个组合
            </div>
          </div>
          <a-table-column title="组合名称">
            <template #cell="{ record }">
              <div class="combination-name">
                <a-tag v-for="(spec, index) in record.combination" :key="index" :color="getTagColor(index)"
                  class="mr-1">
                  {{ spec.valueName }}
                </a-tag>
                <!-- 默认标识 -->
                <a-tag v-if="record.is_default == 1" color="gold" class="ml-2">
                  <template #icon><icon-star-fill /></template>
                  默认
                </a-tag>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="价格" :width="120">
            <template #cell="{ record }">
              <a-input-number v-model="record.price" :min="0" :precision="2" placeholder="输入价格" style="width: 100%" />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="180">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="setDefaultCombination(record)"
                  :class="{ 'default-btn-active': isDefaultCombination(record) }">
                  <template #icon>
                    <icon-star-fill v-if="isDefaultCombination(record)" />
                    <icon-star v-else />
                  </template>
                  {{ isDefaultCombination(record) ? '取消默认' : '设为默认' }}
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>

      <!-- 批量操作 -->


      <!-- 选择操作提示 -->
      <!-- <a-alert 
        v-if="selectedRowKeys.length > 0"
        type="info" 
        :message="`已选择 ${selectedRowKeys.length} 个组合，可进行批量操作`"
        show-icon 
        style="margin-top: 16px;"
      /> -->
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconStarFill, IconStar } from '@arco-design/web-vue/es/icon'
import api from '../api/specification'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

// 响应式数据
const combinationList = ref([])
const batchPrice = ref(0)
const selectedRowKeys = ref([])
const defaultCombinationId = ref(null)

// 计算属性

// 获取选中的组合对象
const selectedCombinations = computed(() => {
  return combinationList.value.filter(item => selectedRowKeys.value.includes(item.id))
})

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    generateCombinations()
    resetBatchOperations()
  }
})

// 获取标签颜色
const getTagColor = (index) => {
  const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan']
  return colors[index % colors.length]
}


// 生成所有规格组合
const generateCombinations = async () => {
  try {
    const res = await api.getSpecList()

    if (res && res.data) {
      const specData = res.data
      const combinations = Array.isArray(specData) ? specData : [specData]

      combinationList.value = combinations.map((item, index) => {
        const combination = item.spec_details.map(detail => ({
          specId: detail.sku_id,
          specName: detail.sku_name,
          valueId: detail.value_id,
          valueName: detail.value_name
        }))

        return {
          id: item.combination_id,
          combination: combination,
          price: item.price,
          status: item.status,
          combination_string: item.combination_string,
          specIds: item.spec_ids || [],
          is_default: item.is_default
        }
      })

      Message.success(`加载了 ${combinationList.value.length} 个规格组合`)
    } else {
      Message.warning('未获取到规格组合数据')
    }
  } catch (error) {
    console.error('获取规格组合失败:', error)
    Message.error('获取规格组合数据失败')
  }
}

// 设置默认组合
const setDefaultCombination = (record) => {
  if (record.is_default == 1) {
    defaultCombinationId.value = null
    record.is_default = null
    Message.success('已取消默认组合设置')
  } else {
    // 先将所有组合的is_default设置为0
    combinationList.value.forEach(item => {
      item.is_default = 0
    })

    // 设置新的默认组合
    defaultCombinationId.value = record.id
    record.is_default = 1
    Message.success(`已设置 "${record.combination_string}" 为默认组合`)
  }
}

// 检查是否为默认组合
const isDefaultCombination = (record) => {
  return record.is_default == 1
}

// 批量设置价格
const batchSetPrice = () => {
  if (!batchPrice.value || batchPrice.value <= 0) {
    Message.warning('请输入有效的批量价格')
    return
  }

  if (selectedRowKeys.value.length === 0) {
    Message.warning('请先选择要设置价格的组合')
    return
  }

  selectedCombinations.value.forEach(combination => {
    combination.price = batchPrice.value
  })

  Message.success(`已为 ${selectedRowKeys.value.length} 个组合设置价格为 ¥${batchPrice.value}`)
  clearSelection()
}

// 批量重置价格
const batchResetPrice = () => {
  if (selectedRowKeys.value.length === 0) {
    Message.warning('请先选择要重置价格的组合')
    return
  }

  selectedCombinations.value.forEach(combination => {
    combination.price = 0
  })

  Message.success(`已重置 ${selectedRowKeys.value.length} 个组合的价格`)
  clearSelection()
}

// 全选组合
const selectAllCombinations = () => {
  selectedRowKeys.value = combinationList.value.map(item => item.id)
  Message.success('已全选所有组合')
}

// 清除选择
const clearSelection = () => {
  selectedRowKeys.value = []
}

// 重置批量操作
const resetBatchOperations = () => {
  batchPrice.value = 0
  clearSelection()
}

// 保存组合定价
const saveCombinationPricing = async () => {
  try {
    const updateData = combinationList.value.map(item => ({
      combination_string: item.combination_string,
      price: item.price,
      status: item.status,
      combination_id: item.id,
      specIds: item.specIds,
      is_default: item.is_default,
    }))

    const response = await api.updateCombinationPrices({
      combinations: updateData
    })

    if (response.code === 200) {
      Message.success('组合定价保存成功！')
      emit('update:visible', false)
      emit('success')
    } else {
      Message.error('组合定价保存失败！')
    }
  } catch (error) {
    console.error('保存组合定价失败:', error)
    Message.error('保存失败，请重试')
  }
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
  resetBatchOperations()
}
</script>

<style scoped>
.mr-1 {
  margin-right: 4px;
}

.mb-1 {
  margin-bottom: 4px;
}

.ml-1 {
  margin-left: 4px;
}

.ml-2 {
  margin-left: 8px;
}

.combination-pricing-content {
  max-height: 700px;
}

.batch-operations h4 {
  color: #1d2129;
  font-weight: 600;
}

.combination-name {
  line-height: 1.5;
}

.combination-name .arco-tag {
  margin-bottom: 4px;
}

.default-btn-active {
  color: #f7ba1e;
}
</style>