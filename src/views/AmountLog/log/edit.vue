<template>
  <component is="a-modal" :width="tool.getDevice() === 'mobile' ? '100%' : '600px'" v-model:visible="visible"
    :title="title" :mask-closable="false" :ok-loading="loading" @cancel="close" @before-ok="submit">
    <!-- 表单信息 start -->
    <a-form ref="formRef" :model="formData" :rules="rules" :auto-label-width="true">
      <a-form-item label="用户" field="user_id">
        <a-select placeholder="请选择用户" v-model="formData.user_id" allow-search @search="searchUser"
          :loading="userLoading">
          <a-option v-for="item in userList" :value="item.id" :label="item.nickname" />
        </a-select>
      </a-form-item>
      <a-form-item label="变动余额" field="amount">
        <a-input v-model="formData.amount" placeholder="请输入变动余额" />
      </a-form-item>
      <a-form-item label="类型" field="type">
        <a-select placeholder="请选择类型" v-model="formData.type" :options="typeOptions" allow-clear />
      </a-form-item>
      <a-form-item label="备注" field="remark">
        <a-input v-model="formData.remark" placeholder="请输入备注" />
      </a-form-item>
    </a-form>
    <!-- 表单信息 end -->
  </component>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import tool from '@/utils/tool'
import { Message, Modal } from '@arco-design/web-vue'
import api from '../api/log'
import userApi from '../../user/api/user'

const emit = defineEmits(['success'])
// 引用定义
const visible = ref(false)
const loading = ref(false)
const formRef = ref()
const mode = ref('')
const userList = ref([])
const userLoading = ref(false)
let title = computed(() => {
  return '用户余额记录' + (mode.value == 'add' ? '-新增' : '-编辑')
})

// 表单初始值
const initialFormData = {
  id: null,
  user_id: null,
  amount: '0.00',
  type: null,
  remark: '',
}

// 类型选项
const typeOptions = ref([
  {
    value: 0,
    label: '收益',
  },
  {
    value: 1,
    label: '提现',
  },
])

// 表单信息
const formData = reactive({ ...initialFormData })

// 验证规则
const rules = {
  user_id: [{ required: true, message: '用户ID必需填写' }],
  amount: [{ required: true, message: '变动余额必需填写' }],
  type: [{ required: true, message: '必须选择类型' }],
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
  // userLoading.value = true
  await searchUser()
}
// 搜索用户
const searchUser = async (value) => {
  // console.log(value)
  userLoading.value = true
  const userResp = await userApi.getPageList({ nickname: value })
  userList.value = userResp.data.data
  userLoading.value = false
}
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
