<template>
  <component is="a-modal" :width="tool.getDevice() === 'mobile' ? '100%' : '600px'" v-model:visible="visible"
    :title="title" :mask-closable="false" :ok-loading="loading" @cancel="close" @before-ok="submit">
    <!-- 表单信息 start -->
    <a-form ref="formRef" :model="formData" :rules="rules" :auto-label-width="true">
      <a-form-item label="所属订单ID" field="order_id">
        <a-input v-model="formData.order_id" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="评论用户" field="user_id">
        <a-input v-model="formData.user_id" placeholder="请输入" />
      </a-form-item>
      <a-form-item label="评论内容" field="content">
        <a-input v-model="formData.content" placeholder="请输入评论内容" />
      </a-form-item>
      <a-form-item label="评分" field="rate">
        <a-rate v-model="formData.rate" placeholder="请选择评分" />
      </a-form-item>
      <a-form-item label="评论图片" field="images">
        <sa-upload-image v-model="formData.images" :limit="8" :multiple="true" />
      </a-form-item>
      <a-form-item label="是否隐藏" field="status">
        <sa-switch v-model="formData.status" checkedValue="1" uncheckedValue="0" checkedText="隐藏" uncheckedText="显示" />
      </a-form-item>
    </a-form>
    <!-- 表单信息 end -->
  </component>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import tool from '@/utils/tool'
import { Message, Modal } from '@arco-design/web-vue'
import api from '../api/comment'

const emit = defineEmits(['success'])
// 引用定义
const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const mode = ref('')

let title = computed(() => {
  return '订单评论管理' + (mode.value == 'add' ? '-新增' : '-编辑')
})

// 表单初始值
const initialFormData = {
  id: null,
  order_id: null,
  user_id: null,
  content: '',
  rate: '',
  images: '',
  status: null,
}

// 表单信息
const formData = reactive({ ...initialFormData })

// 验证规则
const rules = {
  order_id: [{ required: true, message: '必须填写' }],
  user_id: [{ required: true, message: '必须填写' }],
  content: [{ required: true, message: '必须填写' }],
  rate: [{ required: true, message: '必须选择评分' }],
  status: [{ required: true, message: '必须选择是否隐藏' }],
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
const initPage = async () => { }

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
