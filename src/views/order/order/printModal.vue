<template>
  <a-modal
    :visible="visible"
    @cancel="handleCancel"
    @ok="handleOk"
    :title="'打印电子面单'"
    :mask-closable="false"
    :unmount-on-close="true"
    :footer="false"
    width="800px"
  >
    <div class="print-modal-container">
      <div class="print-selection">
        <a-alert type="info" class="mb-4">
          <template #message>
            请选择需要打印电子面单的订单，只有已发货且有物流单号的订单才能打印电子面单
          </template>
        </a-alert>
        
        <a-table
          :data="orderList"
          :loading="loading"
          :pagination="pagination"
          @page-change="onPageChange"
          @page-size-change="onPageSizeChange"
          row-key="id"
          v-model:selectedKeys="selectedOrders"
          :row-selection="{
            type: 'checkbox',
            showCheckedAll: true,
            onlyCurrent: false,
            // onChange: onSelectionChange
          }"
        >
          <template #columns>
            <a-table-column title="订单号" data-index="order_sn" />
            <a-table-column title="收件人" data-index="address.consignee" />
            <a-table-column title="联系电话" data-index="address.mobile" />
            <a-table-column title="物流单号" data-index="billCode">
              <template #cell="{ record }">
                <span v-if="record.billCode">{{ record.billCode }}</span>
                <a-tag v-else color="red">未发货</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="订单状态" data-index="status">
              <template #cell="{ record }">
                <a-tag :color="getStatusColor(record.status)">
                  {{ getStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
      
      <div class="print-actions mt-4">
        <a-space>
          <a-button type="primary" @click="handlePrint" :loading="printLoading" :disabled="selectedOrders.length === 0">
            <template #icon><icon-printer /></template>
            打印选中订单
          </a-button>
          <a-button @click="handleCancel">
            取消
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import api from '../api/order'

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 定义emit
const emit = defineEmits(['update:visible', 'success'])

// 状态变量
const loading = ref(false)
const printLoading = ref(false)
const orderList = ref([])
const selectedOrders = ref([])
// watch(()=>selectedOrders.value,()=>{
//   console.log(selectedOrders)

// })
// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showTotal: true,
  showPageSize: true,
})

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      // 只获取已发货的订单
      status: 1, // 假设状态2表示已发货
    }
    const res = await api.getPageList(params)
    if (res.code === 200) {
      orderList.value = res.data.data || []
      pagination.total = res.data.total || 0
    } else {
      Message.error(res.msg || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    Message.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 分页变化
const onPageChange = (page) => {
  pagination.current = page
  fetchOrders()
}

// 每页条数变化
const onPageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.current = 1
  fetchOrders()
}

// // 选择变化
// const onSelectionChange = (rowKeys) => {
//   console.log(rowKeys)
//   selectedOrders.value = rowKeys
// }

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待付款',
    1: '待发货',
    2: '已发货',
    3: '已完成',
    4: '已取消',
    5: '已关闭'
  }
  return statusMap[status] || '未知状态'
}

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    0: 'orange',
    1: 'blue',
    2: 'green',
    3: 'purple',
    4: 'red',
    5: 'gray'
  }
  return colorMap[status] || 'default'
}

// 打印电子面单
const handlePrint = async () => {
  if (selectedOrders.value.length === 0) {
    Message.warning('请选择需要打印的订单')
    return
  }
  
  printLoading.value = true
  try {
    // 这里需要后端提供打印电子面单的API
    // 假设API为 printExpressSheet
    const res = await api.printExpressSheet({
      orderIds: selectedOrders.value
    })
    
    if (res.code === 200) {
      Message.success('打印成功')
      emit('success')
      handleCancel()
    } else {
      Message.error(res.msg || '打印失败')
    }
  } catch (error) {
    console.error('打印失败:', error)
    Message.error('打印失败，请重试')
  } finally {
    printLoading.value = false
  }
}

// 取消
const handleCancel = () => {
  emit('update:visible', false)
  selectedOrders.value = []
}

// 确认
const handleOk = () => {
  handlePrint()
}

// 监听visible变化，当显示时获取订单列表
watch(() => props.visible, (val) => {
  if (val) {
    fetchOrders()
  }
})
</script>

<style scoped>
.print-modal-container {
  padding: 0 10px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}
</style>