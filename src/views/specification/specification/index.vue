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

    <!-- 组合定价组件 -->
    <combination-pricing 
      v-model:visible="combinationPricingVisible" 
      @success="refresh"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSettings } from '@arco-design/web-vue/es/icon'
import EditForm from './edit.vue'
import CombinationPricing from './combinationPricing.vue'
import api from '../api/specification'

// 引用定义
const crudRef = ref()
const editRef = ref()
const combinationPricingVisible = ref(false)

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
}

// SaTable 数据请求
const refresh = async () => {
  crudRef.value?.refresh()
}

// 页面加载完成执行
onMounted(async () => {
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
</style>
