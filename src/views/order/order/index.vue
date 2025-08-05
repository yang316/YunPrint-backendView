<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="支付方式" field="payType">
            <a-input v-model="searchForm.payType" placeholder="请输入支付方式" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="用户ID" field="user_id">
            <a-select placeholder="请选择用户" v-model="searchForm.user_id" allow-search @search="handleStudySearch"
              :loading="studyLoding">
              <a-option v-for="item in userList" :value="item.id" :label="item.nickname" />
            </a-select>
          </a-form-item>
        </a-col>
      </template>

      <!-- Table 自定义渲染 -->
      <template #operationBeforeExtend="{ record }">
        <a-button type="text" size="small" @click="showOrderDetails(record.id)">
          <template #icon><icon-eye /></template>
          查看详情
        </a-button>
      </template>
    </sa-table>

    <!-- 编辑表单 -->
    <edit-form ref="editRef" @success="refresh" />
    
    <!-- 订单详情弹窗 -->
    <a-modal
      v-model:visible="detailVisible"
      title="订单详情"
      :width="800"
      :footer="false"
      @cancel="closeDetails">
      <div v-if="orderItems.length > 0">
        <a-card v-for="(item, index) in orderItems" :key="item.id" :title="`文件 ${index + 1}: ${item.fileName}`" style="margin-bottom: 16px;">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="文件名">
              {{ item.fileName }}
            </a-descriptions-item>
            <a-descriptions-item label="总页数">
              {{ item.totalPage }}
            </a-descriptions-item>
            <a-descriptions-item label="份数">
              {{ item.copies }}
            </a-descriptions-item>
            <a-descriptions-item label="单价">
              ¥{{ item.paperPrice }}
            </a-descriptions-item>
            <a-descriptions-item label="总价">
              ¥{{ item.totalPrice }}
            </a-descriptions-item>
            <a-descriptions-item label="附件ID">
              {{ item.atta_id }}
            </a-descriptions-item>
          </a-descriptions>
          
          <!-- 打印选项 -->
          <div style="margin-top: 16px;">
            <h4>打印选项:</h4>
            <a-row :gutter="16">
              <a-col v-for="option in item.options" :key="option.type" :span="8">
                <a-tag color="blue">{{ option.name }}</a-tag>
                <span v-if="option.price > 0"> (+¥{{ option.price }})</span>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </div>
      <a-empty v-else description="暂无订单项数据" />
    </a-modal>

  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import EditForm from './edit.vue'
import api from '../api/order'
import userApi from '../../user/api/user'

// 引用定义
const crudRef = ref()
const editRef = ref()
const viewRef = ref()
// 订单详情相关
const detailVisible = ref(false)
const orderItems = ref([])
const userList = ref([])
// 搜索表单
const searchForm = ref({
  payType: '',
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
  { title: '用户ID', dataIndex: 'user.nickname', width: 180 },
  { title: '订单号', dataIndex: 'order_sn', width: 180 },
  { title: '总价', dataIndex: 'totalPrice', width: 180 },
  { title: '优惠券', dataIndex: 'couponPrice', width: 180 },
  { title: '邮费', dataIndex: 'postage', width: 180 },
  { title: '支付方式', dataIndex: 'payType', width: 180 },
  { title: '订单状态',type:'dict',dict:'orderStatus', dataIndex: 'status', width: 180 },
  { title: '支付状态',type:'dict',dict:'payStatus', dataIndex: 'payStatus', width: 180 },
])

// 页面数据初始化
const initPage = async () => {
  const userResp = await userApi.getPageList()
  userList.value = userResp.data.data
}
//搜索用户
const handleStudySearch = async()=>{
  searchForm.user_id = value
  window.setTimeout(() => {

    userApi.getPageList({ nickname: value }).then(value => {
      userList.value = value.data.data
    })
  }, 2000)
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

// 关闭详情弹窗
const closeDetails = () => {
  detailVisible.value = false
  orderItems.value = []
}

// // 解析打印选项
// const parseOptions = (optionsStr) => {
//   console.log(optionsStr)
//   try {
//     return JSON.parse(optionsStr || '[]')
//   } catch (error) {
//     console.error('解析选项失败:', error)
//     return []
//   }
// }

// 页面加载完成执行
onMounted(async () => {
  initPage()
  refresh()
})
</script>
