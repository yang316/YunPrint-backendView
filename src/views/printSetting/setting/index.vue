<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="选项类型" field="type">
            <sa-select v-model="searchForm.type" dict="print_option_type" placeholder="请选择选项类型" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="选项名称" field="name">
            <a-input v-model="searchForm.name" placeholder="请输入选项名称" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="创建时间" field="create_time">
            <a-range-picker v-model="searchForm.create_time" :show-time="true" mode="date" />
          </a-form-item>
        </a-col>
      </template>
      <template #status="{ record }">
        <sa-switch v-model="record.status" checkedValue="1" uncheckedValue="0" @change="changeStatus($event, record.id)"></sa-switch>
      </template>

      <!-- 价格列 -->
      <template #price="{ record }">
        <span>¥{{ record.price }}</span>
      </template>
      <!-- Table 自定义渲染 -->
    </sa-table>

    <!-- 编辑表单 -->
    <edit-form ref="editRef" @success="refresh" />

  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import EditForm from './edit.vue'
import api from '../api/setting'

// 引用定义
const crudRef = ref()
const editRef = ref()
const viewRef = ref()

// 搜索表单
const searchForm = ref({
  type: '',
  name: '',
  create_time: [],
})

// SaTable 基础配置
const options = reactive({
  api: api.getPageList,
  rowSelection: { showCheckedAll: true },
  add: {
    show: true,
    auth: ['/backend/printSetting/PrintSetting/save'],
    func: async () => {
      editRef.value?.open()
    },
  },
  edit: {
    show: true,
    auth: ['/backend/printSetting/PrintSetting/update'],
    func: async (record) => {
      editRef.value?.open('edit')
      editRef.value?.setFormData(record)
    },
  },
  delete: {
    show: true,
    auth: ['/backend/printSetting/PrintSetting/destroy'],
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
  { title: '选项类型', dataIndex: 'type', width: 120, type: 'dict', dict: 'print_option_type' },
  { title: '选项名称', dataIndex: 'name', width: 150 },
  { title: '选项值', dataIndex: 'value', width: 120 },
  { title: '价格(元)', dataIndex: 'price', width: 100, slotName: 'price' },
  { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '是否默认', dataIndex: 'is_default', width: 100, type: 'dict', dict: 'yes_or_no' },
  { title: '状态', dataIndex: 'status',  type: 'dict', dict: 'is_disable' ,width: 100 },
  { title: '创建时间', dataIndex: 'create_time', width: 180 },
])

//
const changeStatus = async (status, id) => {
  const response = await api.changeStatus({ id:id, status:status })
  if (response.code === 200) {
    Message.success(response.message)
    crudRef.value.refresh()
  }
}
// 页面数据初始化
const initPage = async () => {}

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
