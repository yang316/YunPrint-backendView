<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="用户ID" field="user_id">
            <a-select placeholder="请选择用户" v-model="searchForm.user_id" allow-search @search="handleUserSearch"
              :loading="userLoading">
              <a-option v-for="item in userList" :value="item.id" :label="item.nickname" />
            </a-select>
          </a-form-item>


        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="评分" field="rate">
            <a-select v-model="searchForm.rate" placeholder="请选择评分" allow-clear>
              <a-option value="1">1分</a-option>
              <a-option value="2">2分</a-option>
              <a-option value="3">3分</a-option>
              <a-option value="4">4分</a-option>
              <a-option value="5">5分</a-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="是否隐藏" field="status">
            <a-select v-model="searchForm.status" placeholder="请选择是否隐藏" allow-clear>
              <a-option value="0">显示</a-option>
              <a-option value="1">隐藏</a-option>
            </a-select>
          </a-form-item>
        </a-col>
      </template>

      <!-- Table 自定义渲染 -->
      <template #status="{ record }">
        <sa-switch v-model="record.status" @change="changeStatus($event, record.id)" checkedValue="1" uncheckedValue="0"
          checkedText="隐藏" uncheckedText="显示">

        </sa-switch>
      </template>
    </sa-table>

    <!-- 编辑表单 -->
    <edit-form ref="editRef" @success="refresh" />

  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import EditForm from './edit.vue'
import api from '../api/comment'
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
  status: '',
  rate: '',
  orderBy: 'id',
  orderSort: 'desc',
})

// SaTable 基础配置
const options = reactive({
  api: api.getPageList,
  rowSelection: { showCheckedAll: true },
  add: {
    show: false,
    auth: ['/backend/OrderComment/OrderComment/save'],
    func: async () => {
      editRef.value?.open()
    },
  },
  edit: {
    show: true,
    auth: ['/backend/OrderComment/OrderComment/update'],
    func: async (record) => {
      editRef.value?.open('edit')
      editRef.value?.setFormData(record)
    },
  },
  delete: {
    show: true,
    auth: ['/backend/OrderComment/OrderComment/destroy'],
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

  { title: 'id', dataIndex: 'id', width: 70 },
  { title: '订单ID', dataIndex: 'order_id', width: 70 },
  { title: '用户', dataIndex: 'user.nickname', width: 180 },
  // { title: '评论内容', dataIndex: 'content', width: 180 },
  { title: '评分', dataIndex: 'rate', width: 180 },
  // { title: '评论图片', dataIndex: 'images', type: 'image', width: 120 },
  { title: '是否隐藏', dataIndex: 'status', width: 180 },
])
//搜索用户
const handleUserSearch = async (value) => {
  searchForm.user_id = value
  userLoading.value = true
  window.setTimeout(() => {
    userApi.getPageList({ nickname: value }).then(value => {
      userList.value = value.data.data
      userLoading.value = false
    })
  }, 2000)
}
// 页面数据初始化
const initPage = async () => {
  await handleUserSearch()
}

// SaTable 数据请求
const refresh = async () => {
  crudRef.value?.refresh()
}
// 修改状态
const changeStatus = async (status, id) => {
  const resp = await api.changeStatus({
    id: id,
    status: status,
  })
  if (resp.code === 200) {
    Message.success(`操作成功！`)
    crudRef.value?.refresh()
  }
}
// 页面加载完成执行
onMounted(async () => {
  initPage()
  refresh()
})
</script>
