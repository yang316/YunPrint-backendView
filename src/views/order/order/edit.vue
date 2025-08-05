<template>
  <component
    is="a-modal"
    :width="tool.getDevice() === 'mobile' ? '100%' : '600px'"
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :ok-loading="loading"
    @cancel="close"
    @before-ok="submit">
    <!-- 表单信息 start -->
    <a-form ref="formRef" :model="formData" :rules="rules" :auto-label-width="true">
      <a-form-item label="用户" field="user_id">
        <a-select placeholder="请选择用户" v-model="formData.user_id" allow-search @search="searchUser"
          :loading="studyLoding">
          <a-option v-for="item in userList" :value="item.id" :label="item.nickname" />
        </a-select>
      </a-form-item>
      <a-form-item label="订单号" field="order_sn" >
        <a-input v-model="formData.order_sn" placeholder="请输入订单号" />
      </a-form-item>
      <a-form-item label="总价" field="totalPrice">
        <a-input-number v-model="formData.totalPrice" placeholder="请输入总价" />
      </a-form-item>
      <a-form-item label="优惠券金额" field="couponPrice">
        <a-input-number v-model="formData.couponPrice" placeholder="请输入优惠券" />
      </a-form-item>
      <a-form-item label="邮费" field="postage">
        <a-input-number v-model="formData.postage" placeholder="请输入邮费" />
      </a-form-item>
      <!-- <a-form-item label="支付方式" field="payType">
        <a-input v-model="formData.payType" placeholder="请输入支付方式" />
      </a-form-item> -->
      <a-form-item label="订单状态" field="status">
        <!-- <a-input v-model="formData.status" placeholder="请输入订单状态" /> -->
        <sa-radio v-model="formData.status" dict="orderStatus"></sa-radio>
      </a-form-item>
      <a-form-item label="支付状态" field="payStatus">
        <sa-radio v-model="formData.payStatus" dict="payStatus"></sa-radio>
        <!-- <a-input v-model="formData.payStatus" placeholder="请输入支付状态" /> -->
      </a-form-item>
    </a-form>
    <!-- 表单信息 end -->
    
  </component>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import tool from '@/utils/tool'
import { Message, Modal } from '@arco-design/web-vue'
import api from '../api/order'
import userApi from '../../user/api/user'
const emit = defineEmits(['success'])
// 引用定义
const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const mode = ref('')
const userList = ref([])
let title = computed(() => {
  return '订单管理' + (mode.value == 'add' ? '-新增' : '-编辑')
})

// 表单初始值
const initialFormData = {
  id: null,
  user_id: null,
  order_sn: '',
  totalPrice: 0,
  couponPrice: 0,
  postage: 0,
  payType: 'wechat',
  status: 0,
  payStatus: 0,
}

// 表单信息
const formData = reactive({ ...initialFormData })

// 验证规则
const rules = {
  user_id: [{ required: true, message: '用户ID必需填写' }],
  order_sn: [{ required: true, message: '订单号必需填写' }],
  totalPrice: [{ required: true, message: '总价必需填写' }],
  couponPrice: [{ required: true, message: '优惠券价格必需填写' }],
  postage: [{ required: true, message: '邮费必需填写' }],
  payType: [{ required: true, message: '支付方式必需填写' }],
}

// 打开弹框
const open = async (type = 'add') => {
  mode.value = type
  // 重置表单数据
  Object.assign(formData, initialFormData)
  formRef.value.clearValidate()
  visible.value = true
  await initPage()
}

// 初始化页面数据
const initPage = async () => {
  const userResp = await userApi.getPageList()
  userList.value = userResp.data.data
}

// 设置数据
const setFormData = async (data) => {
  for (const key in formData) {
    if (data[key] != null && data[key] != undefined) {
      formData[key] = data[key]
    }
  }
}
// 搜索用户
const searchUser = async(value)=>{
  console.log(value)
  const userResp = await userApi.getPageList()
  userList.value = userResp.data.data
}
// 数据保存
const submit = async (done) => {
  const validate = await formRef.value?.validate()
  if (!validate) {
    loading.value = true
    let data = { ...formData }
    let result = {}
    if (mode.value === 'add') {
      // 添加数据
      data.id = undefined
      result = await api.save(data)
    } else {
      // 修改数据
      result = await api.update(data.id, data)
    }
    if (result.code === 200) {
      Message.success('操作成功')
      emit('success')
      done(true)
    }
    // 防止连续点击提交
    setTimeout(() => {
      loading.value = false
    }, 500)
  }
  done(false)
}

// 关闭弹窗
const close = () => (visible.value = false)

defineExpose({ open, setFormData })
</script>
