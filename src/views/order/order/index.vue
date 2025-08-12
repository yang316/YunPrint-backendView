<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
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

      <!-- Table 自定义渲染 -->
      <template #operationBeforeExtend="{ record }">
        <a-button type="text" size="small" @click="showOrderDetails(record.id)">
          <template #icon><icon-eye /></template>
          查看详情
        </a-button>
        <a-button v-if="record.status === 1 && record.payStatus === 1 && !record.billCode" type="text" size="small"
          @click="showShippingModal(record)" style="color: #00b42a;">
          <template #icon>
            <sa-icon icon="bi:handbag" />
          </template>
          发货
        </a-button>
      </template>
    </sa-table>

    <!-- 编辑表单 -->
    <edit-form ref="editRef" @success="refresh" />

    <!-- 订单详情弹窗 -->
    <a-modal v-model:visible="detailVisible" title="订单详情" :width="800" :footer="false" @cancel="closeDetails">
      <div v-if="orderItems.length > 0">
        <a-card v-for="(item, index) in orderItems" :key="item.id" :title="`文件 ${index + 1}: ${item.fileName}`"
          style="margin-bottom: 16px;">
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
            <!-- <a-descriptions-item label="单价">
              ¥{{ item.paperPrice }}
            </a-descriptions-item> -->
            <a-descriptions-item label="总价">
              ¥{{ item.totalPrice }}
            </a-descriptions-item>
            <!-- <a-descriptions-item label="附件ID">
              {{ item.atta_id }}
            </a-descriptions-item> -->
          </a-descriptions>

          <!-- 打印选项 -->
          <div style="margin-top: 16px;">
            <h4 style="margin-bottom: 12px; color: #1d2129; font-weight: 600;">打印选项</h4>
            <div v-if="item.options && item.options.length > 0"
              style="background: #f7f8fa; padding: 16px; border-radius: 6px;">
              <a-space wrap :size="[12, 8]">
                <div v-for="option in item.options" :key="option.type"
                  style="display: flex; align-items: center; background: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #e5e6eb;">
                  <a-tag :color="getOptionColor(option.type)" style="margin: 0; margin-right: 8px; border-radius: 4px;">
                    {{ option.name }}
                  </a-tag>
                  <!-- <span style="color: #4e5969; font-size: 13px;">{{ option.value }}</span> -->
                </div>
              </a-space>

              <!-- 特殊内容展示 -->
              <div v-if="item.coverText || item.coverUrl"
                style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e6eb;">
                <!-- 文字封面内容 -->
                <div v-if="item.coverText" style="margin-bottom: 12px;">
                  <div
                    style="color: #1d2129; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center;">
                    <a-tag color="orange" style="margin-right: 8px;">封面文字</a-tag>
                  </div>
                  <div
                    style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e6eb; color: #4e5969; line-height: 1.5;">
                    {{ item.coverText }}
                  </div>
                </div>

                <!-- 图片封面展示 -->
                <div v-if="item.coverUrl">
                  <div
                    style="color: #1d2129; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center;">
                    <a-tag color="purple" style="margin-right: 8px;">封面图片</a-tag>
                  </div>
                  <div
                    style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e6eb; text-align: center;">
                    <a-image :src="item.coverUrl" style="max-width: 200px; max-height: 200px; border-radius: 4px;" />
                  </div>
                </div>
              </div>
            </div>
            <a-empty v-else description="暂无打印选项" size="small" style="margin: 20px 0;" />
          </div>

        </a-card>
      </div>
      <a-empty v-else description="暂无订单项数据" />
    </a-modal>

    <!-- 发货弹窗 -->
    <a-modal v-model:visible="shippingVisible" title="订单发货" :width="700" @ok="handleShipping"
      @cancel="closeShippingModal" :ok-loading="shippingLoading">
      <div v-if="selectedOrder">
        <!-- 订单基本信息 -->
        <a-descriptions :column="2" bordered style="margin-bottom: 16px;">
          <a-descriptions-item label="订单号">
            {{ selectedOrder.order_sn }}
          </a-descriptions-item>
          <a-descriptions-item label="用户">
            {{ selectedOrder.user?.nickname }}
          </a-descriptions-item>
          <a-descriptions-item label="订单金额">
            ¥{{ selectedOrder.totalPrice }}
          </a-descriptions-item>
          <a-descriptions-item label="订单状态">
            {{ selectedOrder.status == 1 ? '待发货' : '已发货' }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 发货表单 -->
        <a-form :model="shippingForm" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="收货人姓名" required>
                <a-input v-model="shippingForm.receiver_name" placeholder="请输入收货人姓名" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="收货人电话" required>
                <a-input v-model="shippingForm.receiver_phone" placeholder="请输入收货人电话" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item label="收货地址" required>
            <a-textarea v-model="shippingForm.receiver_address" placeholder="请输入详细收货地址" :rows="2" />
          </a-form-item>

          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="省份" required>
                <a-input v-model="shippingForm.province" placeholder="省份" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="城市" required>
                <a-input v-model="shippingForm.city" placeholder="城市" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="区县" required>
                <a-input v-model="shippingForm.district" placeholder="区县" />
              </a-form-item>
            </a-col>
          </a-row>

          <!-- <a-form-item label="物品重量(kg)">
            <a-input-number v-model="shippingForm.weight" :min="0.1" :step="0.1" placeholder="请输入物品重量"
              style="width: 100%;" />
          </a-form-item>

          <a-form-item label="物品描述">
            <a-input v-model="shippingForm.goods_desc" placeholder="打印文件" />
          </a-form-item>

          <a-form-item label="备注">
            <a-textarea v-model="shippingForm.remark" placeholder="发货备注（可选）" :rows="2" />
          </a-form-item> -->
        </a-form>
      </div>
    </a-modal>

  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import EditForm from './edit.vue'
import api from '../api/order'
import userApi from '../../user/api/user'
import shippingApi from '../api/shipping'

// 引用定义
const crudRef = ref()
const editRef = ref()
const viewRef = ref()
// 订单详情相关
const detailVisible = ref(false)
const orderItems = ref([])
const detailLoading = ref(false)
const userList = ref([])
const userLoading = ref(false)

// 发货相关
const shippingVisible = ref(false)
const selectedOrder = ref(null)
const shippingLoading = ref(false)
const shippingForm = ref({
  receiver_name: '',
  receiver_phone: '',
  receiver_address: '',
  province: '',
  city: '',
  district: '',
  weight: 0.5,
  goods_desc: '打印文件',
  remark: ''
})
// 搜索表单
const searchForm = ref({
  payStatus: '',
  orderBy: 'id',
  orderType: 'desc',
  status: '',
  status: '',
  user_id: '',
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

// 显示发货弹窗
const showShippingModal = (record) => {
  // console.log(record)
  selectedOrder.value = record
  // 重置表单
  shippingForm.value = {
    receiver_name: record.address?.consignee || '',
    receiver_phone: record.address?.mobile || '',
    receiver_address: record.address?.region?.detail || '',
    province: record.address?.region?.province || '',
    city: record.address?.region?.city || '',
    district: record.address?.region?.district || '',
    // weight: 0.5,
    // goods_desc: '打印文件',
    // remark: ''
  }
  shippingVisible.value = true
}

// 关闭发货弹窗
const closeShippingModal = () => {
  shippingVisible.value = false
  selectedOrder.value = null
}

// 处理发货
const handleShipping = async () => {
  if (!selectedOrder.value) return

  // 表单验证
  if (!shippingForm.value.receiver_name ||
    !shippingForm.value.receiver_phone ||
    !shippingForm.value.province ||
    !shippingForm.value.city ||
    !shippingForm.value.district ||
    !shippingForm.value.receiver_address) {
    Message.error('请填写完整的收货信息')
    return
  }

  try {
    shippingLoading.value = true

    // 构建中通物流电子面单参数
    const shippingData = {
      order_id: selectedOrder.value.id,
      order_sn: selectedOrder.value.order_sn,
      receiver: {
        name: shippingForm.value.receiver_name,
        phone: shippingForm.value.receiver_phone,
        address: shippingForm.value.receiver_address,
        province: shippingForm.value.province,
        city: shippingForm.value.city,
        district: shippingForm.value.district
      },
      // goods: {
      //   weight: shippingForm.value.weight,
      //   description: shippingForm.value.goods_desc
      // },
      // remark: shippingForm.value.remark
    }

    // 调用中通物流电子面单API
    const response = await api.handleShipping(shippingData)

    if (response.code !== 200) {
      throw new Error(response.message || '创建电子面单失败')
    }

    Message.success('发货成功！')
    closeShippingModal()

    // 刷新列表
    crudRef.value?.refresh()

  } catch (error) {
    console.error('发货失败:', error)
    Message.error('发货失败，请重试')
  } finally {
    shippingLoading.value = false
  }
}

// 获取选项颜色
const getOptionColor = (optionType) => {
  const colorMap = {
    'paperSize': 'blue',
    'paperType': 'green',
    'printSide': 'cyan',
    'printColor': 'magenta',
    'binding': 'gold',
    'coverContent': 'orange',
    'orientation': 'purple',
    'quality': 'red',
    'copies': 'lime'
  }
  return colorMap[optionType] || 'blue'
}

// 页面加载完成执行
onMounted(async () => {
  initPage()
  refresh()
})
</script>
