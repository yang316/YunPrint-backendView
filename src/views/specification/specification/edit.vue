<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    width="900px"
    @cancel="close"
    @before-ok="save"
    :confirm-loading="loading"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="规格分类" field="category" required>
            <sa-select v-model="form.category" dict="specification_category" placeholder="请选择规格分类" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="规格名称" field="name" required>
            <a-input v-model="form.name" placeholder="请输入规格名称" />
          </a-form-item>
        </a-col>
      </a-row>
      
      <a-form-item label="规格描述" field="description">
        <a-textarea v-model="form.description" placeholder="请输入规格描述" :rows="3" />
      </a-form-item>
      
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="排序" field="sort">
            <a-input-number v-model="form.sort" placeholder="排序值" :min="0" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="状态" field="status">
            <sa-select v-model="form.status" dict="is_disable" placeholder="请选择状态" />
          </a-form-item>
        </a-col>
      </a-row>

      <!-- 规格值设置 -->
      <a-form-item label="规格值设置">
        <div class="spec-values-container">
          <div class="spec-values-header">
            <span>规格值列表</span>
            <a-button type="primary" size="small" @click="addSpecValue">
              <template #icon><icon-plus /></template>
              添加规格值
            </a-button>
          </div>
          
          <div class="spec-values-list">
            <div v-for="(item, index) in form.spec_values" :key="index" class="spec-value-item">
              <a-row :gutter="8" align="center">
                <a-col :span="6">
                  <a-input v-model="item.name" placeholder="规格值名称" />
                </a-col>
                <a-col :span="4">
                  <a-input-number v-model="item.price" placeholder="价格" :min="0" :precision="2" />
                </a-col>
                <a-col :span="3">
                  <a-input-number v-model="item.sort" placeholder="排序" :min="0" />
                </a-col>
                <a-col :span="4">
                  <a-select v-model="item.status" placeholder="状态">
                    <a-option value="1">启用</a-option>
                    <a-option value="0">禁用</a-option>
                  </a-select>
                </a-col>
                <a-col :span="6">
                  <a-input v-model="item.description" placeholder="描述" />
                </a-col>
                <a-col :span="1">
                  <a-button type="text" status="danger" size="small" @click="removeSpecValue(index)">
                    <template #icon><icon-delete /></template>
                  </a-button>
                </a-col>
              </a-row>
            </div>
            
            <a-empty v-if="form.spec_values.length === 0" description="暂无规格值，请添加" />
          </div>
        </div>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconPlus, IconDelete } from '@arco-design/web-vue/es/icon'
import api from '../api/specification'

const emit = defineEmits(['success'])

// 表单引用
const formRef = ref()
const visible = ref(false)
const loading = ref(false)
const type = ref('add')

// 表单数据
const form = reactive({
  id: '',
  category: '',
  name: '',
  description: '',
  sort: 0,
  status: '1',
  spec_values: []
})

// 表单验证规则
const rules = {
  category: [{ required: true, message: '请选择规格分类' }],
  name: [{ required: true, message: '请输入规格名称' }],
}

// 弹窗标题
const title = computed(() => {
  return type.value === 'add' ? '添加规格' : '编辑规格'
})

// 打开弹窗
const open = (t = 'add') => {
  type.value = t
  visible.value = true
  if (type.value === 'add') {
    resetForm()
  }
}

// 关闭弹窗
const close = () => {
  visible.value = false
  resetForm()
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: '',
    category: '',
    name: '',
    description: '',
    sort: 0,
    status: '1',
    spec_values: []
  })
}

// 设置表单数据
const setFormData = (data) => {
  Object.assign(form, {
    ...data,
    spec_values: data.spec_values || []
  })
}

// 添加规格值
const addSpecValue = () => {
  form.spec_values.push({
    name: '',
    price: 0,
    sort: 0,
    status: '1',
    description: ''
  })
}

// 删除规格值
const removeSpecValue = (index) => {
  form.spec_values.splice(index, 1)
}

// 保存数据
const save = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) {
    loading.value = true
    try {
      let response
      if (type.value === 'add') {
        response = await api.save(form)
      } else {
        response = await api.update(form.id, form)
      }
      
      if (response.code === 200) {
        Message.success(response.message || '操作成功')
        emit('success')
        close()
      }
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      loading.value = false
    }
  }
  return false
}

// 暴露方法
defineExpose({
  open,
  setFormData
})
</script>

<style scoped>
.spec-values-container {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
}

.spec-values-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
}

.spec-values-list {
  max-height: 300px;
  overflow-y: auto;
}

.spec-value-item {
  padding: 8px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: #fafafa;
}

.spec-value-item:last-child {
  margin-bottom: 0;
}
</style>