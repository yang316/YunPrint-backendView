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
      <a-form-item label="昵称" field="nickname">
        <a-input v-model="formData.nickname" placeholder="请输入昵称" />
      </a-form-item>
      <a-form-item label="头像" field="avatar">
        <sa-upload-image v-model="formData.avatar"  :multiple="false" />
      </a-form-item>
      <a-form-item label="手机号" field="mobile">
        <a-input v-model="formData.mobile" placeholder="请输入手机号" />
      </a-form-item>
      <!-- <a-form-item label="密码" field="password">
        <a-input v-model="formData.password" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item label="性别" field="gender">
        <sa-select v-model="formData.gender" dict="gender" placeholder="请选择性别" allow-clear />
      </a-form-item>
      <a-form-item label="年龄" field="age">
        <a-input v-model="formData.age" placeholder="请输入年龄" />
      </a-form-item> -->
      <a-form-item label="注册时间" field="regist_time">
        <a-date-picker v-model="formData.regist_time" :show-time="true" mode="date" placeholder="请选择注册时间" />
      </a-form-item>
    </a-form>
    <!-- 表单信息 end -->
  </component>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import tool from '@/utils/tool'
import { Message, Modal } from '@arco-design/web-vue'
import api from '../api/user'

const emit = defineEmits(['success'])
// 引用定义
const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const mode = ref('')

let title = computed(() => {
  return '用户管理' + (mode.value == 'add' ? '-新增' : '-编辑')
})

// 表单初始值
const initialFormData = {
  id: null,
  nickname: '',
  avatar: '',
  mobile: '',
  password: '',
  gender: null,
  age: null,
  regist_time: '',
}

// 表单信息
const formData = reactive({ ...initialFormData })

// 验证规则
const rules = {
  nickname: [{ required: true, message: '昵称必需填写' }],
  avatar: [{ required: true, message: '头像必需填写' }],
  // mobile: [{ required: true, message: '手机号必需填写' }],
  // password: [{ required: true, message: '密码必需填写' }],
  // gender: [{ required: true, message: '性别必需填写' }],
  // age: [{ required: true, message: '年龄必需填写' }],
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
