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
        <!-- <a-col :sm="8" :xs="24">
          <a-form-item label="优惠券类型" field="type">
            <a-input v-model="searchForm.type" placeholder="请输入优惠券类型" allow-clear />
          </a-form-item>
        </a-col> -->
      </template>

      <!-- Table 自定义渲染 -->
      <template #operationBeforeExtend="{ record }">
        <a-button type="text" size="small" @click="showDistributeModal(record)">
          <template #icon><icon-gift /></template>
          发放
        </a-button>
      </template>
    </sa-table>

    <!-- 编辑表单 -->
    <edit-form ref="editRef" @success="refresh" />

    <!-- 发放优惠券弹窗 -->
    <a-modal v-model:visible="distributeVisible" title="发放优惠券" :width="600" @ok="handleDistribute"
      @cancel="closeDistributeModal">
      <div v-if="selectedTemplate">
        <a-descriptions :column="1" bordered style="margin-bottom: 16px;">
          <a-descriptions-item label="优惠券标题">
            {{ selectedTemplate.title }}
          </a-descriptions-item>
          <a-descriptions-item label="优惠金额">
            ¥{{ selectedTemplate.amount }}
          </a-descriptions-item>
          <a-descriptions-item label="满减门槛">
            ¥{{ selectedTemplate.min_amount }}
          </a-descriptions-item>
          <a-descriptions-item label="有效天数">
            {{ selectedTemplate.valid_days }}天
          </a-descriptions-item>
        </a-descriptions>

        <a-form :model="distributeForm" layout="vertical">
          <a-form-item label="选择用户" required>
            <a-select v-model="distributeForm.user_ids" placeholder="请选择要发放的用户" multiple allow-search
              :loading="userLoading" @search="searchUsers" style="width: 100%;">
              <a-option v-for="user in userList" :key="user.id" :value="user.id" :label="user.nickname">
                {{ user.nickname }} ({{ user.mobile }})
              </a-option>
            </a-select>
          </a-form-item>

          <!-- <a-form-item label="发放数量">
            <a-input-number
              v-model="distributeForm.quantity"
              :min="1"
              :max="10"
              placeholder="每个用户发放的数量"
              style="width: 100%;"
            />
          </a-form-item> -->

          <a-form-item label="备注">
            <a-textarea v-model="distributeForm.remark" placeholder="发放备注（可选）" :rows="3" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import EditForm from './edit.vue'
import api from '../api/template'
import userApi from '../../user/api/user'
// 引用定义
const crudRef = ref()
const editRef = ref()
const viewRef = ref()
// 发放优惠券相关
const distributeVisible = ref(false)
const selectedTemplate = ref(null)
const userList = ref([])
const userLoading = ref(false)
const distributeForm = ref({
  user_ids: [],
  quantity: 1,
  remark: ''
})

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
  operationColumn: {
    width: 200,
  },
  operationColumnAlign: 'center',
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
const initPage = async () => { }

// SaTable 数据请求
const refresh = async () => {
  crudRef.value?.refresh()
}

// 显示发放弹窗
const showDistributeModal = async (record) => {
  selectedTemplate.value = record
  distributeVisible.value = true
  // 重置表单
  distributeForm.value = {
    user_ids: [],
    quantity: 1,
    remark: ''
  }
  // 加载用户列表
  await loadUsers()
}

// 关闭发放弹窗
const closeDistributeModal = () => {
  distributeVisible.value = false
  selectedTemplate.value = null
  userList.value = []
}

// 加载用户列表
const loadUsers = async (keyword = '') => {
  userLoading.value = true
  try {
    // 这里需要调用用户API，暂时使用模拟数据
    const result = await userApi.getPageList({ nickname: keyword })
    userList.value = result.data.data || []

    // 模拟用户数据
    // userList.value = [
    //   { id: 1, nickname: '用户1', phone: '13800138001', email: 'user1@example.com' },
    //   { id: 2, nickname: '用户2', phone: '13800138002', email: 'user2@example.com' },
    //   { id: 3, nickname: '用户3', phone: '13800138003', email: 'user3@example.com' }
    // ]
  } catch (error) {
    Message.error('加载用户列表失败')
    console.error(error)
  } finally {
    userLoading.value = false
  }
}

// 搜索用户
const searchUsers = async (keyword) => {
  await loadUsers(keyword)
}

// 处理发放优惠券
const handleDistribute = async () => {
  if (!distributeForm.value.user_ids.length) {
    Message.warning('请选择要发放的用户')
    return
  }

  try {
    // 这里调用您自己写的发放接口
    const params = {
      template_id: selectedTemplate.value.id,
      user_ids: distributeForm.value.user_ids,
      quantity: distributeForm.value.quantity,
      remark: distributeForm.value.remark
    }

    // 示例API调用（需要您实现具体的API）
    const result = await api.distributeCoupon(params)
    if (result.code === 200) {
      Message.success('优惠券发放成功')
      closeDistributeModal()
    }

    // 发放成功提示
    Message.success(`已向 ${distributeForm.value.user_ids.length} 个用户发放优惠券，每人 ${distributeForm.value.quantity} 张`)
    closeDistributeModal()

  } catch (error) {
    Message.error('发放失败')
    console.error(error)
  }
}

// 页面加载完成执行
onMounted(async () => {
  initPage()
  refresh()
})
</script>
