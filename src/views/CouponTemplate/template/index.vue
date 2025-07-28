<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="优惠券标题" field="title">
            <a-input v-model="searchForm.title" placeholder="请输入优惠券标题" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="优惠券类型" field="type">
            <a-input v-model="searchForm.type" placeholder="请输入优惠券类型" allow-clear />
          </a-form-item>
        </a-col>
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
import api from '../api/template'

// 引用定义
const crudRef = ref()
const editRef = ref()
const viewRef = ref()

// 搜索表单
const searchForm = ref({
  title: '',
  type: '',
})

// SaTable 基础配置
const options = reactive({
  api: api.getPageList,
  rowSelection: { showCheckedAll: true },
  add: {
    show: true,
    auth: ['/backend/CouponTemplate/CouponTemplate/save'],
    func: async () => {
      editRef.value?.open()
    },
  },
  edit: {
    show: true,
    auth: ['/backend/CouponTemplate/CouponTemplate/update'],
    func: async (record) => {
      editRef.value?.open('edit')
      editRef.value?.setFormData(record)
    },
  },
  delete: {
    show: true,
    auth: ['/backend/CouponTemplate/CouponTemplate/destroy'],
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
  { title: '优惠券标题', dataIndex: 'title', width: 180 },
  // { title: '优惠券类型', dataIndex: 'type', width: 180 },
  { title: '优惠金额', dataIndex: 'amount', width: 180 },
  { title: '满减门槛金额', dataIndex: 'min_amount', width: 180 },
  { title: '有效天数', dataIndex: 'valid_days', width: 180 },
  { title: '创建时间', dataIndex: 'created_time', width: 180 },
  { title: '更新时间', dataIndex: 'updated_time', width: 180 },
])

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
