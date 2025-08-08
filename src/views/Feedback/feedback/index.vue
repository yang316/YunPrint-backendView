<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-form-item label="用户" field="user_id">
          <a-select placeholder="请选择用户" v-model="searchForm.user_id" allow-search @search="handleUserSearch"
            :loading="userLoading">
            <a-option v-for="item in userList" :value="item.id" :label="item.nickname" />
          </a-select>
        </a-form-item>
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
import api from '../api/feedback'
import userApi from '../../user/api/user'
// 引用定义
const crudRef = ref()
const editRef = ref()
const viewRef = ref()
const userList = ref([])
const userLoading = ref(false)
// 搜索表单
const searchForm = ref({
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
    auth: ['/backend/Feedback/Feedback/save'],
    func: async () => {
      editRef.value?.open()
    },
  },
  edit: {
    show: true,
    auth: ['/backend/Feedback/Feedback/update'],
    func: async (record) => {
      editRef.value?.open('edit')
      editRef.value?.setFormData(record)
    },
  },
  delete: {
    show: true,
    auth: ['/backend/Feedback/Feedback/destroy'],
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
  { title: '用户', dataIndex: 'user_id', width: 180 },
  { title: '内容', dataIndex: 'content', width: 180 },
  { title: '图片内容', dataIndex: 'images', type: 'image', width: 120 },
])

// 页面数据初始化
const initPage = async () => {
  await handleUserSearch()
}

//搜索用户
const handleUserSearch = async (value) => {
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
