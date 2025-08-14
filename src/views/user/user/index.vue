<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="昵称" field="nickname">
            <a-input v-model="searchForm.nickname" placeholder="请输入昵称" allow-clear />
          </a-form-item>
        </a-col>
      </template>

      <template #status="{ record }">
        <sa-switch v-model="record.status" checkedValue="1" uncheckedValue="0" checkedText="正常" uncheckedText="禁用"
          @change="changeStatus(record.status == 1 ? 0 : 1, record.id)"></sa-switch>
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
import api from '../api/user'

// 引用定义
const crudRef = ref()
const editRef = ref()
const viewRef = ref()

// 搜索表单
const searchForm = ref({
  nickname: '',
})

// SaTable 基础配置
const options = reactive({
  api: api.getPageList,
  rowSelection: { showCheckedAll: true },
  add: {
    show: false,
    auth: ['/backend/user/User/save'],
    func: async () => {
      editRef.value?.open()
    },
  },
  edit: {
    show: true,
    auth: ['/backend/user/User/update'],
    func: async (record) => {
      editRef.value?.open('edit')
      editRef.value?.setFormData(record)
    },
  },
  delete: {
    show: true,
    auth: ['/backend/user/User/destroy'],
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
  { title: 'ID', dataIndex: 'id', width: 180 },
  { title: '昵称', dataIndex: 'nickname', width: 180 },
  { title: '头像', dataIndex: 'avatar', type: 'image', width: 120 },
  { title: '状态', dataIndex: 'status', width: 200 },
  // { title: '手机号', dataIndex: 'mobile', width: 180 },
  // { title: '密码', dataIndex: 'password', width: 180 },
  // { title: '性别', dataIndex: 'gender', type: 'dict', dict: 'gender', width: 120 },
  // { title: '年龄', dataIndex: 'age', width: 180 },
  { title: '注册时间', dataIndex: 'regist_time', width: 180 },
])

// 状态切换
const changeStatus = async (status, id) => {
  console.log(status)
  console.log(id)
  const response = await api.changeStatus({ id: id, status: status })
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
