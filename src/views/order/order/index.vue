<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm"
      @selection-change="selectionChange">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="订单状态" field="status">
            <sa-select v-model="searchForm.status" dict="orderStatus" placeholder="请选择订单状态" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="支付状态" field="payStatus">
            <sa-select v-model="searchForm.payStatus" dict="payStatus" placeholder="请选择支付状态" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="用户ID" field="user_id">
            <a-select placeholder="请选择用户" v-model="searchForm.user_id" allow-search @search="handleUserSearch"
              :loading="userLoading">
              <a-option v-for="item in userList" :value="item.id" :label="item.nickname" />
            </a-select>
          </a-form-item>
        </a-col>
      </template>
      <!-- 添加自定义工具栏按钮 -->
      <template #tools>
        <a-button type="primary" @click="handleExport" :loading="exportLoading" :disabled="selections.length === 0">
          <template #icon><icon-download /></template>
          导出选中数据
        </a-button>
      </template>
      <!-- Table 自定义渲染 -->
      <template #operationBeforeExtend="{ record }">
        <a-button type="text" size="small" @click="showOrderDetails(record.id)">
          <template #icon><icon-eye /></template>
          查看详情
        </a-button>
        <a-button v-if="record.status === 1 && record.payStatus === 1 && record.refundStatus != 2 && !record.billCode"
          type="text" size="small" @click="showShippingModal(record)" style="color: #00b42a;">
          <template #icon>
            <sa-icon icon="bi:handbag" />
          </template>
          发货
        </a-button>
        <a-button v-if="record.refundStatus === 1 && record.payStatus === 1" type="text" size="small"
          @click="showRefundModal(record)" style="color: #f53f3f;">
          <template #icon>
            <sa-icon icon="bi:cash-coin" />
          </template>
          审核退款
        </a-button>
      </template>
    </sa-table>

    <!-- 编辑表单 -->
    <edit-form ref="editRef" @success="refresh" />

    <!-- 退款审核组件 -->
    <refund-modal :visible="refundVisible" @update:visible="refundVisible = $event" :order-data="selectedRefundOrder"
      @success="handleRefundSuccess" />

    <!-- 发货组件 -->
    <shipping-modal :visible="shippingVisible" @update:visible="shippingVisible = $event" :order-data="selectedOrder"
      @success="handleShippingSuccess" />

    <!-- 订单详情组件 -->
    <order-detail-modal :visible="detailVisible" @update:visible="detailVisible = $event" :order-items="orderItems" />

  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import EditForm from './edit.vue'
import RefundModal from './refund.vue'
import ShippingModal from './shipping.vue'
import OrderDetailModal from './orderDetail.vue'
import api from '../api/order'
import userApi from '../../user/api/user'

// 引用定义
const crudRef = ref()
const editRef = ref()

// 退款相关
const refundVisible = ref(false)
const selectedRefundOrder = ref(null)

// 发货相关
const shippingVisible = ref(false)
const selectedOrder = ref(null)

// 订单详情相关
const detailVisible = ref(false)
const orderItems = ref([])

// 其他状态
const userList = ref([])
const userLoading = ref(false)
const exportLoading = ref(false)
const selections = ref([])

const selectionChange = (row) => {
  selections.value = row
}

// 搜索表单
const searchForm = ref({
  payStatus: '',
  orderBy: 'id',
  orderType: 'desc',
  status: '',
  user_id: '',
  ids: ''
})

// SaTable 基础配置
const options = reactive({
  api: api.getPageList,
  rowSelection: { showCheckedAll: true },
  add: {
    show: false,
    auth: ['/backend/order/Order/save'],
    func: async () => {
      editRef.value?.open()
    },
  },
  edit: {
    show: true,
    auth: ['/backend/backend/order/Order/update'],
    func: async (record) => {
      editRef.value?.open('edit')
      editRef.value?.setFormData(record)
    },
  },
  delete: {
    show: true,
    auth: ['/backend/order/Order/destroy'],
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
  { title: 'id', dataIndex: 'id', width: 100, sortable: { sortDirections: ['ascend', 'descend'] } },
  { title: '用户', dataIndex: 'user.nickname', width: 180 },
  { title: '订单号', dataIndex: 'order_sn', width: 180 },
  { title: '总价', dataIndex: 'totalPrice', width: 70 },
  { title: '优惠券', dataIndex: 'couponPrice', width: 70 },
  { title: '邮费', dataIndex: 'postage', width: 70 },
  { title: '支付方式', dataIndex: 'payType', width: 70 },
  { title: '订单状态', type: 'dict', dict: 'orderStatus', dataIndex: 'status', width: 70 },
  { title: '支付状态', type: 'dict', dict: 'payStatus', dataIndex: 'payStatus', width: 70 },
])

// 导出功能
const handleExport = async () => {
  if (selections.value.length === 0) {
    Message.warning('请先选择要导出的数据')
    return
  }

  exportLoading.value = true
  const ids = selections.value.join(',')
  searchForm.value.ids = ids

  try {
    const resp = await api.export(searchForm.value)
    let excelData
    if (resp.data && typeof resp.data === 'object' && resp.data.data) {
      excelData = resp.data.data
    } else {
      excelData = resp.data
    }

    const blob = new Blob([excelData], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    let fileName = '订单导出.xlsx'
    const headers = resp.headers || (resp.data && resp.data.headers)
    if (headers && headers['content-disposition']) {
      const match = headers['content-disposition'].match(/filename="([^"]+)"/)
      if (match && match[1]) {
        fileName = decodeURIComponent(match[1])
      }
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    window.setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)

    Message.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    Message.error('导出失败，请重试')
  } finally {
    exportLoading.value = false
  }
}

// 页面数据初始化
const initPage = async () => {
  await handleUserSearch()
}

// 搜索用户
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

// 显示订单详情
const showOrderDetails = async (orderId) => {
  try {
    const result = await api.getOrderItems(orderId)
    if (result.code === 200) {
      orderItems.value = result.data || []
      detailVisible.value = true
    } else {
      Message.error('获取订单详情失败')
    }
  } catch (error) {
    Message.error('获取订单详情失败')
    console.error(error)
  }
}

// 显示发货弹窗
const showShippingModal = (record) => {
  selectedOrder.value = record
  shippingVisible.value = true
}

// 显示退款审核弹窗
const showRefundModal = (record) => {
  selectedRefundOrder.value = record
  refundVisible.value = true
}

// 退款审核成功回调
const handleRefundSuccess = () => {
  Message.success('退款审核完成')
  crudRef.value?.refresh()
  selectedRefundOrder.value = null
}

// 发货成功回调
const handleShippingSuccess = () => {
  Message.success('发货成功')
  crudRef.value?.refresh()
  selectedOrder.value = null
}

// 页面加载完成执行
onMounted(async () => {
  initPage()
  refresh()
})
</script>
