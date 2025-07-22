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
      <a-form-item label="选项类型" field="type">
        <sa-select v-model="formData.type" dict="print_option_type" placeholder="请选择选项类型" />
      </a-form-item>
      <a-form-item label="选项名称" field="name">
        <a-input v-model="formData.name" placeholder="请输入选项名称" />
      </a-form-item>
      <a-form-item label="选项值" field="value">
        <a-input v-model="formData.value" placeholder="请输入选项值" />
      </a-form-item>
      <a-form-item label="价格" field="price">
        <a-input v-model="formData.price" placeholder="请输入价格" />
      </a-form-item>
      <a-form-item label="排序" field="sort">
        <a-input v-model="formData.sort" placeholder="请输入排序" />
      </a-form-item>
      <a-form-item label="是否默认" field="is_default">
        <sa-radio v-model="formData.is_default" dict="yes_or_no" placeholder="请选择是否默认" allow-clear />
      </a-form-item>
      <a-form-item label="状态" field="status">
        <sa-switch v-model="formData.status" checkedValue="1" uncheckedValue="0" dict="is_disable" placeholder="请选择状态" allow-clear />
      </a-form-item>
    </a-form>
    <!-- 表单信息 end -->
  </component>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import tool from '@/utils/tool'
import { Message, Modal } from '@arco-design/web-vue'
import api from '../api/setting'

const emit = defineEmits(['success'])
// 引用定义
const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const mode = ref('')

let title = computed(() => {
  return '打印设置' + (mode.value == 'add' ? '-新增' : '-编辑')
})

// 表单初始值
const initialFormData = {
  id: null,
  name: '',
  value: '',
  price: '0.00',
  sort: null,
  is_default: 1,
  status: 0,
  type: '',
}

// 表单信息
const formData = reactive({ ...initialFormData })

// 验证规则
const rules = {
  type: [{ required: true, message: '选项类型必需填写' }],
  name: [{ required: true, message: '选项名称必需填写' }],
  value: [{ required: true, message: '选项值必需填写' }],
  price: [{ required: true, message: '价格必需填写' }],
  sort: [{ required: true, message: '排序必需填写' }],
  is_default: [{ required: true, message: '是否默认必需填写' }],
  status: [{ required: true, message: '状态必需填写' }],
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
