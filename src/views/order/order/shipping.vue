<template>
  <a-modal 
    :visible="visible" 
    @update:visible="handleVisibleChange"
    title="订单发货" 
    :width="700" 
    @ok="handleShipping" 
    @cancel="handleCancel"
    :ok-loading="loading"
  >
    <div v-if="orderData">
      <!-- 订单基本信息 -->
      <a-descriptions :column="2" bordered style="margin-bottom: 16px;">
        <a-descriptions-item label="订单号">
          {{ orderData.order_sn }}
        </a-descriptions-item>
        <a-descriptions-item label="用户">
          {{ orderData.user?.nickname }}
        </a-descriptions-item>
        <a-descriptions-item label="订单金额">
          ¥{{ orderData.totalPrice }}
        </a-descriptions-item>
        <a-descriptions-item label="订单状态">
          {{ orderData.status == 1 ? '待发货' : '已发货' }}
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
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import api from '../api/order'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  orderData: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible', 'success'])

// 响应式数据
const loading = ref(false)
const shippingForm = ref({
  receiver_name: '',
  receiver_phone: '',
  receiver_address: '',
  province: '',
  city: '',
  district: ''
})

// 处理弹窗显示状态变化
const handleVisibleChange = (newVisible) => {
  emit('update:visible', newVisible)
}

// 监听弹窗显示状态和订单数据变化
watch([() => props.visible, () => props.orderData], ([newVisible, newOrderData]) => {
  if (newVisible && newOrderData) {
    // 重置表单并填充地址信息
    shippingForm.value = {
      receiver_name: newOrderData.address?.consignee || '',
      receiver_phone: newOrderData.address?.mobile || '',
      receiver_address: newOrderData.address?.region?.detail || '',
      province: newOrderData.address?.region?.province || '',
      city: newOrderData.address?.region?.city || '',
      district: newOrderData.address?.region?.district || ''
    }
  }
})

// 处理发货
const handleShipping = async () => {
  if (!props.orderData) return

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
    loading.value = true

    // 构建发货参数
    const shippingData = {
      order_id: props.orderData.id,
      order_sn: props.orderData.order_sn,
      receiver: {
        name: shippingForm.value.receiver_name,
        phone: shippingForm.value.receiver_phone,
        address: shippingForm.value.receiver_address,
        province: shippingForm.value.province,
        city: shippingForm.value.city,
        district: shippingForm.value.district
      }
    }

    // 调用发货API
    const response = await api.handleShipping(shippingData)

    if (response.code !== 200) {
      throw new Error(response.message || '发货失败')
    }

    Message.success('发货成功！')
    handleCancel()
    emit('success')
    
  } catch (error) {
    console.error('发货失败:', error)
    Message.error('发货失败，请重试')
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
}
</script>