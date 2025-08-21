<template>
  <a-modal 
    :visible="visible" 
    @update:visible="handleVisibleChange"
    title="退款审核" 
    :width="600" 
    @ok="handleRefund" 
    @cancel="handleCancel"
    :ok-loading="loading"
    :ok-text="refundForm.action === 'approve' ? '通过退款' : '拒绝退款'"
    :ok-button-props="{ status: refundForm.action === 'approve' ? 'success' : 'danger' }"
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
        <a-descriptions-item label="支付状态">
          <a-tag :color="orderData.payStatus === 1 ? 'green' : 'red'">
            {{ orderData.payStatus === 1 ? '已支付' : '未支付' }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <!-- 退款信息 -->
      <a-card title="退款信息" style="margin-bottom: 16px;">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="申请退款金额">
            <span style="color: #f53f3f; font-weight: 600; font-size: 16px;">
              ¥{{ refundAmount }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item label="退款原因">
            <div >
              {{ orderData.remark || '用户未填写退款原因' }}
            </div>
          </a-descriptions-item>
          
          <!-- <a-descriptions-item label="申请时间">
            {{ orderData.refundApplyTime || '暂无' }}
          </a-descriptions-item> -->
        </a-descriptions>
      </a-card>

      <!-- 审核操作 -->
      <a-card title="审核操作">
        <a-form :model="refundForm" layout="vertical">
          <a-form-item label="审核结果" required>
            <a-radio-group v-model="refundForm.action" @change="handleActionChange">
              <a-radio value="approve">
                <span style="color: #00b42a; font-weight: 500;">通过退款</span>
              </a-radio>
              <a-radio value="reject">
                <span style="color: #f53f3f; font-weight: 500;">拒绝退款</span>
              </a-radio>
            </a-radio-group>
          </a-form-item>

          <!-- 拒绝原因输入框 -->
          <a-form-item 
            v-if="refundForm.action === 'reject'" 
            label="拒绝原因" 
            required
            :rules="[{ required: true, message: '请输入拒绝原因' }]"
          >
            <a-textarea 
              v-model="refundForm.rejectReason" 
              placeholder="请详细说明拒绝退款的原因..." 
              :rows="4"
              :max-length="500"
              show-word-limit
            />
          </a-form-item>

          <!-- 通过时的备注 -->
          <a-form-item 
            v-if="refundForm.action === 'approve'" 
            label="审核备注"
          >
            <a-textarea 
              v-model="refundForm.approveRemark" 
              placeholder="审核备注（可选）" 
              :rows="3"
              :max-length="200"
              show-word-limit
            />
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
const refundForm = ref({
  action: 'approve', // approve: 通过, reject: 拒绝
  rejectReason: '',
  approveRemark: ''
})

// 计算退款金额（这里可以根据业务逻辑调整）
const refundAmount = computed(() => {
  if (!props.orderData) return 0
  // 退款金额 = 订单总价 - 邮费（根据业务需求调整）
  // return (props.orderData.totalPrice - (props.orderData.postage || 0)).toFixed(2)
  return props.orderData.totalPrice.toFixed(2)
})

// 处理弹窗显示状态变化
const handleVisibleChange = (newVisible) => {
  emit('update:visible', newVisible)
}

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 重置表单
    refundForm.value = {
      action: 'approve',
      rejectReason: '',
      approveRemark: ''
    }
  }
})

// 处理审核结果变化
const handleActionChange = () => {
  // 清空之前的输入
  refundForm.value.rejectReason = ''
  refundForm.value.approveRemark = ''
}

// 处理退款审核
const handleRefund = async () => {
  // 表单验证
  if (refundForm.value.action === 'reject' && !refundForm.value.rejectReason.trim()) {
    Message.error('请输入拒绝原因')
    return
  }

  try {
    loading.value = true

    // 构建请求参数
    const params = {
      order_id: props.orderData.id,
      order_sn: props.orderData.order_sn,
      action: refundForm.value.action,
      refund_amount: refundAmount.value,
      reason: refundForm.value.action === 'reject' 
        ? refundForm.value.rejectReason 
        : refundForm.value.approveRemark || '审核通过',
      operator_id: 1 // 这里应该是当前管理员ID
    }

    // TODO: 调用后端API
    const response = await api.handleRefund(params)
    
    // 模拟API调用
    // await new Promise(resolve => setTimeout(resolve, 1000))
    
    Message.success(
      refundForm.value.action === 'approve' 
        ? '退款审核通过，退款将在1-3个工作日内到账' 
        : '已拒绝退款申请'
    )
    
    // 关闭弹窗并触发成功回调
    handleCancel()
    emit('success')
    
  } catch (error) {
    console.error('退款审核失败:', error)
    Message.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.refund-amount {
  font-size: 18px;
  font-weight: 600;
  color: #f53f3f;
}

.refund-reason {
  background: #f7f8fa;
  padding: 12px;
  border-radius: 4px;
  line-height: 1.5;
  color: #4e5969;
}
</style>