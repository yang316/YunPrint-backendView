<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <!-- <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="规格分类" field="category">
            <sa-select v-model="searchForm.category" dict="specification_category" placeholder="请选择规格分类" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="规格名称" field="name">
            <a-input v-model="searchForm.name" placeholder="请输入规格名称" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="状态" field="status">
            <sa-select v-model="searchForm.status" dict="is_disable" placeholder="请选择状态" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="创建时间" field="create_time">
            <a-range-picker v-model="searchForm.create_time" :show-time="true" mode="date" />
          </a-form-item>
        </a-col>
      </template> -->

      <template #tableAfterButtons>
        <!-- 设置价格功能 -->
        <a-button type="primary" @click="openCombinationPricing">
          <template #icon><icon-settings /></template>
          组合定价
        </a-button>
      </template>

      <!-- 状态列 -->
      <template #status="{ record }">
        <sa-switch v-model="record.status" checkedValue="1" uncheckedValue="0"
          @change="changeStatus($event, record.id)"></sa-switch>
      </template>

      <!-- 规格值列 -->
      <template #specValues="{ record }">
        <a-tag v-for="(value, index) in record.specValues" :key="index" class="mr-1 mb-1" :color="getTagColor(index)">
          {{ value.name }}
          <span v-if="value.price > 0" class="ml-1">+¥{{ value.price }}</span>
        </a-tag>
      </template>

    </sa-table>

    <!-- 编辑表单 -->
    <edit-form ref="editRef" @success="refresh" />

    <!-- 组合定价弹窗 -->
    <a-modal v-model:visible="combinationPricingVisible" title="规格组合定价" width="1200px" @ok="saveCombinationPricing"
      @cancel="cancelCombinationPricing">
      <div class="combination-pricing-content">
        <a-alert type="info" message="" show-icon style="margin-bottom: 16px">提示：为不同的规格组合设置价格，未设置价格的组合将使用基础价格</a-alert>


        <!-- 组合生成控制 -->
        <!-- <div class="combination-controls"
          style="margin-bottom: 16px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
          <h4 style="margin-bottom: 12px;">组合生成设置</h4>
          <a-space>
            <a-button @click="generateCombinations" type="primary">生成所有组合</a-button>
            <a-button @click="clearCombinations">清空组合</a-button>
            <span style="color: #666;">当前组合数量: {{ combinationList.length }}</span>
          </a-space>
        </div> -->

        <!-- 组合价格表格 -->
        <a-table :data="combinationList" :pagination="false">
          <template #columns>
            <a-table-column title="组合名称">
              <template #cell="{ record }">
                <div class="combination-name">
                  <a-tag v-for="(spec, index) in record.combination" :key="index" :color="getTagColor(index)"
                    class="mr-1">
                    <!-- {{ spec.specName }}:  -->
                    {{ spec.valueName }}
                  </a-tag>
                  <!-- 默认标识 -->
                  <a-tag v-if="isDefaultCombination(record)" color="gold" class="ml-2">
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

            <!-- <a-table-column title="状态">
              <template #cell="{ record }">
                <sa-switch v-model="record.status" checkedValue="1" uncheckedValue="0" checkedText="启用"
                  uncheckedText="禁用" />

              </template>
            </a-table-column> -->
            <!-- <a-table-column title="操作" :width="180">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="setDefaultCombination(record)"
                    :class="{ 'default-btn-active': isDefaultCombination(record) }">
                    <template #icon>
                      <icon-star-fill v-if="isDefaultCombination(record)" />
                      <icon-star v-else />
                    </template>
                    {{ isDefaultCombination(record) ? '取消默认' : '设为默认' }}
                  </a-button> -->
            <!-- <a-button type="text" size="small" @click="resetCombinationPrice(record)">
                    重置
                  </a-button> -->
            <!-- </a-space>
              </template>
            </a-table-column> -->
            <!-- <a-table-column title="操作" width="120">
              <template #cell="{ record }">
                <a-space>
                  <a-button type="text" size="small" @click="resetCombinationPrice(record)">
                    重置
                  </a-button>
                  <a-button type="text" size="small" @click="copyCombinationPrice(record)">
                    复制
                  </a-button> -->
            <!-- </a-space>
          </template> -->
            <!-- </a-table-column> -->
          </template>
        </a-table>

        <!-- 批量操作 -->
        <!-- <div class="batch-operations" style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 6px;">
          <h4 style="margin-bottom: 12px;">批量操作</h4>
          <a-space wrap>
            <a-input-number v-model="batchCombinationPrice" :min="0" :precision="2" placeholder="批量价格"
              style="width: 150px;">
              <template #prefix>¥</template>
            </a-input-number>
            <a-button @click="batchSetCombinationPrice">批量设置价格</a-button>
            <a-button @click="batchResetCombinationPrice">批量重置为基础价格</a-button>
            <a-button @click="batchEnableCombinations">批量启用</a-button>
            <a-button @click="batchDisableCombinations">批量禁用</a-button>
          </a-space>
        </div> -->

      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSettings } from '@arco-design/web-vue/es/icon'
import EditForm from './edit.vue'
import api from '../api/specification'

// 引用定义
const crudRef = ref()
const editRef = ref()
const combinationPricingVisible = ref(false)
const combinationList = ref([])
const batchCombinationPrice = ref(0)

// 搜索表单
const searchForm = ref({
  category: '',
  name: '',
  status: '',
  create_time: [],
})

// SaTable 基础配置
const options = reactive({
  api: api.getPageList,
  rowSelection: { showCheckedAll: true },
  add: {
    show: false,
    auth: ['/backend/PrintSku/PrintSku/save'],
    func: async () => {
      editRef.value?.open()
    },
  },
  edit: {
    show: true,
    auth: ['/backend/PrintSku/PrintSku/update'],
    func: async (record) => {
      editRef.value?.open('edit')
      editRef.value?.setFormData(record)
    },
  },
  delete: {
    show: false,
    auth: ['/backend/PrintSku/PrintSku/destroy'],
    func: async (params) => {
      const resp = await api.destroy(params)
      if (resp.code === 200) {
        Message.success(`删除成功！`)
        crudRef.value?.refresh()
      }
    },
  },
})

// SaTable 列配置
const columns = reactive([
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '规格名称', dataIndex: 'name', width: 150 },
  { title: '规格值', dataIndex: 'specValues', width: 300, slotName: 'specValues' },
  // { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '创建时间', dataIndex: 'create_time', width: 180 },
])

// 修改状态
const changeStatus = async (status, id) => {
  const response = await api.changeStatus({ id: id, status: status })
  if (response.code === 200) {
    Message.success(response.message)
    crudRef.value.refresh()
  }
}

// 获取标签颜色
const getTagColor = (index) => {
  const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan']
  return colors[index % colors.length]
}

// 打开组合定价弹窗
const openCombinationPricing = () => {
  combinationPricingVisible.value = true
  generateCombinations()
}

// 生成所有规格组合
// 在 script setup 中添加默认组合相关的响应式数据和方法
const defaultCombinationId = ref(null) // 存储默认组合的ID

// 设置默认组合
const setDefaultCombination = (record) => {
  // 如果点击的是当前默认组合，则取消默认设置
  if (1 == record.is_default) {
    defaultCombinationId.value = null
    record.is_default = null
    Message.success('已取消默认组合设置')
  } else {
    // 设置新的默认组合
    defaultCombinationId.value = record.id
    record.is_default = 1
    Message.success(`已设置 "${record.combination_string}" 为默认组合`)
  }
}

// 检查是否为默认组合
const isDefaultCombination = (record) => {
  // return defaultCombinationId.value === record.id
  return record.is_default == 1
}

// 在 generateCombinations 函数中添加默认组合的处理
const generateCombinations = async () => {
  try {
    const res = await api.getSpecList()

    // 根据新的数据结构处理
    if (res && res.data) {
      const specData = res.data

      // 如果返回的是单个组合对象，转换为数组格式
      const combinations = Array.isArray(specData) ? specData : [specData]

      combinationList.value = combinations.map((item, index) => {
        // 根据新的数据结构构建组合信息
        const combination = item.spec_details.map(detail => ({
          specId: detail.sku_id,
          specName: detail.sku_name,
          valueId: detail.value_id,
          valueName: detail.value_name
        }))
        // 生成组合名称
        // const combinationName = item.spec_details.map(detail => detail.value_name).join('+')
        return {
          id: item.combination_id,
          combination: combination,
          price: item.price, // 基础价格，可以根据需要计算
          status: item.status,
          combination_string: item.combination_string,
          specIds: item.spec_ids || [],
          is_default: item.is_default,

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


// 笛卡尔积函数
const cartesianProduct = (arrays) => {
  return arrays.reduce((acc, curr) => {
    const result = []
    acc.forEach(accItem => {
      curr.forEach(currItem => {
        result.push([...accItem, currItem])
      })
    })
    return result
  }, [[]])
}


// 批量启用组合
const batchEnableCombinations = () => {
  combinationList.value.forEach(item => {
    item.enabled = true
  })

  Message.success('批量启用组合成功')
}

// 批量禁用组合
const batchDisableCombinations = () => {
  combinationList.value.forEach(item => {
    item.enabled = false
  })

  Message.success('批量禁用组合成功')
}

// 保存组合定价
const saveCombinationPricing = async () => {

  try {
    // 构建要提交的数据
    const updateData = combinationList.value.map(item => ({
      combination_string: item.combination_string,
      price: item.price,//价格
      status: item.status,
      combination_id: item.id,//组合ID
      specIds: item.specIds,//规格ID
      //默认ID

    }))

    // 这里您可以调用实际的API接口
    const response = await api.updateCombinationPrices({
      combinations: updateData,
      default_id: defaultCombinationId.value
    })

    if (response.code === 200) {
      Message.success('组合定价保存成功！')
      combinationPricingVisible.value = false
      refresh()
      return
    } else {
      Message.error('组合定价保存失败！')
    }



  } catch (error) {
    console.error('保存组合定价失败:', error)
    Message.error('保存失败，请重试')
  }
}

// 取消组合定价
const cancelCombinationPricing = () => {
  combinationPricingVisible.value = false
  batchCombinationPrice.value = 0
}

// 页面数据初始化
const initPage = async () => { }

// SaTable 数据请求
const refresh = async () => {
  crudRef.value?.refresh()
}

// 页面加载完成执行
onMounted(async () => {
  initPage()
  refresh()
})
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

.combination-pricing-content {
  max-height: 700px;
}

.combination-controls h4,
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
</style>
