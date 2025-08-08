<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="类型" field="type">
            <a-select placeholder="请选择类型" v-model="searchForm.type" allow-clear>
              <a-option value="0" label="收益" />
              <a-option value="2" label="提现" />
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="用户" field="user_id">
            <a-select placeholder="请选择用户" v-model="searchForm.user_id" allow-search @search="searchUser"
              :loading="userLoading">
              <a-option v-for="item in userList" :value="item.id" :label="item.nickname" />
            </a-select>
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
import api from '../api/log'
import userApi from '../../user/api/user'
import { orderBy } from 'lodash'
// 引用定义
const crudRef = ref()
const editRef = ref()
const viewRef = ref()
const userList = ref([])
const userLoading = ref(false)
// 搜索表单
const searchForm = ref({
  type: '',
  user_id: '',
  orderBy: 'id',
  orderSort: 'desc'
})

// SaTable 基础配置
const options = reactive({
  api: api.getPageList,
  rowSelection: { showCheckedAll: true },
  add: {
    show: true,
    auth: ['/backend/AmountLog/AmountLog/save'],
    func: async () => {
      editRef.value?.open()
    },
  },
  edit: {
    show: true,
    auth: ['/backend/AmountLog/AmountLog/update'],
    func: async (record) => {
      editRef.value?.open('edit')
      editRef.value?.setFormData(record)
    },
  },
  delete: {
    show: true,
    auth: ['/backend/AmountLog/AmountLog/destroy'],
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
  { title: 'id', dataIndex: 'id', width: 100 },
  { title: '用户ID', dataIndex: 'user_id', width: 180 },
  { title: '变动余额', dataIndex: 'amount', width: 180 },
  { title: '类型', dataIndex: 'type', width: 180 },
])

// 页面数据初始化
const initPage = async () => {
  await searchUser()
}
// 搜索用户
const searchUser = async (value) => {
  // console.log(value)
  userLoading.value = true
  const userResp = await userApi.getPageList({ nickname: value })
  userList.value = userResp.data.data
  userLoading.value = false
}
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
