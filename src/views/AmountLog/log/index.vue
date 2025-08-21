<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="类型" field="type">
            <a-select placeholder="请选择类型" v-model="searchForm.type" allow-clear>
              <a-option value="0" label="收益" />
              <a-option value="1" label="提现" />
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
        <a-col :sm="8" :xs="24">
          <a-form-item label="状态" field="status">
            <a-select placeholder="请选择状态" v-model="searchForm.status" allow-clear>
              <a-option value="0" label="待审核" />
              <a-option value="1" label="已通过" />
              <a-option value="2" label="已拒绝" />
            </a-select>
          </a-form-item>
        </a-col>

      </template>

      <!-- Table 自定义渲染 -->
      <template #type="{ record }">
        {{ typeOptions[record.type].label }}
      </template>

      <!-- 状态渲染 -->
      <template #status="{ record }">
        <a-tag v-if="record.status === 0 && record.type == 1" color="orange">待审核</a-tag>
        <a-tag v-else-if="record.status === 1 || record.type == 0" color="green">已通过</a-tag>
        <a-tag v-else-if="record.status === 2 && record.type == 1" color="red">已拒绝</a-tag>
      </template>

      <!-- 图片渲染 -->
      <template #image="{ record }">
        <a-image v-if="record.image" :src="record.image" width="60" height="60" />
        <span v-else>-</span>
      </template>

      <!-- 操作列自定义渲染 -->
      <template #operationBeforeExtend="{ record }">
        <template v-if="record.type === 1 && record.status === 0">
          <a-button type="text" size="small" @click="showAuditModal(record)" style="color: #00b42a;">
            <template #icon><icon-check /></template>
            审核
          </a-button>
        </template>
      </template>
    </sa-table>

    <!-- 编辑表单 -->
    <edit-form ref="editRef" @success="refresh" />

    <!-- 审核弹窗 -->
    <a-modal v-model:visible="auditVisible" title="提现审核" :width="600" @ok="handleAudit" @cancel="closeAuditModal"
      :ok-loading="auditLoading">
      <div v-if="selectedRecord">
        <!-- 提现信息 -->
        <a-descriptions :column="2" bordered style="margin-bottom: 16px;">
          <a-descriptions-item label="用户ID">
            {{ selectedRecord.user_id }}
          </a-descriptions-item>
          <a-descriptions-item label="提现金额">
            ¥{{ selectedRecord.amount }}
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">
            {{ selectedRecord.create_time }}
          </a-descriptions-item>
          <a-descriptions-item label="当前状态">
            <a-tag color="orange">待审核</a-tag>
          </a-descriptions-item>
        </a-descriptions>

        <!-- 凭证图片 -->
        <div v-if="selectedRecord.image" style="margin-bottom: 16px;">
          <div style="margin-bottom: 8px; font-weight: bold;">凭证图片：</div>
          <a-image :src="selectedRecord.image" width="200" height="200" />
        </div>

        <!-- 审核操作 -->
        <a-form :model="auditForm" layout="vertical">
          <a-form-item label="审核结果" required>
            <a-radio-group v-model="auditForm.status">
              <a-radio :value="1">通过</a-radio>
              <a-radio :value="2">拒绝</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="审核备注">
            <a-textarea v-model="auditForm.remark" placeholder="请输入审核备注（可选）" :rows="3" />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCheck } from '@arco-design/web-vue/es/icon'
import EditForm from './edit.vue'
import api from '../api/log'
import userApi from '../../user/api/user'
// 引用定义
const crudRef = ref()
const editRef = ref()
const viewRef = ref()
const userList = ref([])
const userLoading = ref(false)

// 审核相关
const auditVisible = ref(false)
const selectedRecord = ref(null)
const auditLoading = ref(false)
const auditForm = ref({
  status: 1,
  remark: '',
  user_id: ''
})

// 搜索表单
const searchForm = ref({
  type: '',
  user_id: '',
  status: '',
  orderBy: 'id',
  orderSort: 'desc'
})
// 类型选项
const typeOptions = ref([
  {
    value: 0,
    label: '收益',
  },
  {
    value: 1,
    label: '提现',
  },
])

// SaTable 基础配置
const options = reactive({
  api: api.getPageList,
  rowSelection: { showCheckedAll: true },
  add: {
    show: false,
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
  operationColumn: {
    width: 150,
  },
  operationColumnAlign: 'center',
})

// SaTable 列配置
const columns = reactive([
  { title: 'id', dataIndex: 'id', width: 100 },
  { title: '用户', dataIndex: 'user.nickname', width: 180 },
  { title: '变动余额', dataIndex: 'amount', width: 180 },
  { title: '类型', dataIndex: 'type', width: 180 },
  { title: '状态', dataIndex: 'status', width: 120 },
  // { title: '凭证图片', dataIndex: 'image', width: 120 },
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

// 显示审核弹窗
const showAuditModal = (record) => {
  selectedRecord.value = record
  // 重置表单
  auditForm.value = {
    status: 1,
    remark: '',
    user_id: record.user_id,
    amount: record.amount
  }
  auditVisible.value = true
}

// 关闭审核弹窗
const closeAuditModal = () => {
  auditVisible.value = false
  selectedRecord.value = null
}

// 处理审核
const handleAudit = async () => {
  if (!selectedRecord.value) return

  try {
    auditLoading.value = true

    const auditData = {
      id: selectedRecord.value.id,
      status: auditForm.value.status,
      user_id: auditForm.value.user_id,
      remark: auditForm.value.remark,
      amount: auditForm.value.amount
    }

    // 调用审核API
    const response = await api.audit(auditData)

    if (response.code === 200) {
      const statusText = auditForm.value.status === 1 ? '通过' : '拒绝'
      Message.success(`审核${statusText}成功！`)
      closeAuditModal()

      // 刷新列表
      crudRef.value?.refresh()
    } else {
      Message.error(response.message || '审核失败')
    }

  } catch (error) {
    console.error('审核失败:', error)
    Message.error('审核失败，请重试')
  } finally {
    auditLoading.value = false
  }
}

// 页面加载完成执行
onMounted(async () => {
  initPage()
  refresh()
})
</script>
