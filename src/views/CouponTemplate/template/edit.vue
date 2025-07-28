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
      <a-form-item label="优惠券标题" field="title">
        <a-input v-model="formData.title" placeholder="请输入优惠券标题" />
      </a-form-item>
      <a-form-item label="优惠券类型" field="type" hidden>
        <a-input v-model="formData.type" placeholder="请输入优惠券类型" />
      </a-form-item>
      <a-form-item label="优惠金额" field="amount">
        <a-input v-model="formData.amount" placeholder="请输入优惠金额" />
      </a-form-item>
      <a-form-item label="满减门槛金额" field="min_amount">
        <a-input v-model="formData.min_amount" placeholder="请输入满减门槛金额" />
      </a-form-item>
      <a-form-item label="有效天数" field="valid_days" tooltip="领取后n天有效">
        <a-input v-model="formData.valid_days" placeholder="请输入有效天数" />
      </a-form-item>
      <a-form-item label="状态" field="status">
        <a-switch v-model="formData.status" :checkedValue="1"  :uncheckedValue="0" />
      </a-form-item>
    </a-form>
    <!-- 表单信息 end -->
  </component>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import tool from '@/utils/tool'
import { Message, Modal } from '@arco-design/web-vue'
import api from '../api/template'

const emit = defineEmits(['success'])
// 引用定义
const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const mode = ref('')

let title = computed(() => {
  return '优惠券模板表' + (mode.value == 'add' ? '-新增' : '-编辑')
})

// 表单初始值
const initialFormData = {
  id: null,
  title: '',
  type: 1,
  amount: '0.00',
  min_amount: '0.00',
  valid_days: 7,
  status:0,
}

// 表单信息
const formData = reactive({ ...initialFormData })

// 验证规则
const rules = {
  title: [{ required: true, message: '优惠券标题必需填写' }],
  type: [{ required: true, message: '优惠券类型必需填写' }],
  amount: [{ required: true, message: '优惠金额必需填写' }],
  min_amount: [{ required: true, message: '满减门槛金额必需填写' }],
  valid_days: [{ required: true, message: '有效天数必需填写' }],
  status: [{ required: true, message: '状态必须选择' }],
  // created_time: [{ required: true, message: '创建时间必需填写' }],
  // updated_time: [{ required: true, message: '更新时间必需填写' }],
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
const initPage = async () => {}

// 设置数据
const setFormData = async (data) => {
  for (const key in formData) {
    if (data[key] != null && data[key] != undefined) {
      formData[key] = data[key]
    }
  }
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
