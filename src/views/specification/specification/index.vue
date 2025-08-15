<template>
  <div class="ma-content-block">
    <sa-table ref="crudRef" :options="options" :columns="columns" :searchForm="searchForm">
      <!-- 搜索区 tableSearch -->
      <template #tableSearch>
        <a-col :sm="8" :xs="24">
          <a-form-item label="规格分类" field="category">
            <sa-select v-model="searchForm.category" dict="specification_category" placeholder="请选择规格分类" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="规格名称" field="name">
            <a-input v-model="searchForm.name" placeholder="请输入规格名称" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="状态" field="status">
            <sa-select v-model="searchForm.status" dict="is_disable" placeholder="请选择状态" allow-clear />
          </a-form-item>
        </a-col>
        <a-col :sm="8" :xs="24">
          <a-form-item label="创建时间" field="create_time">
            <a-range-picker v-model="searchForm.create_time" :show-time="true" mode="date" />
          </a-form-item>
        </a-col>
      </template>

      <!-- 状态列 -->
      <template #status="{ record }">
        <sa-switch v-model="record.status" checkedValue="1" uncheckedValue="0" @change="changeStatus($event, record.id)"></sa-switch>
      </template>

      <!-- 规格值列 -->
      <template #spec_values="{ record }">
        <a-tag v-for="(value, index) in record.spec_values" :key="index" class="mr-1 mb-1" :color="getTagColor(index)">
          {{ value.name }}
          <span v-if="value.price > 0" class="ml-1">+¥{{ value.price }}</span>
        </a-tag>
      </template>

      <!-- 操作列 -->
      <template #operationBeforeExtend="{ record }">
        <a-button type="text" size="small" @click="viewSpecValues(record)">
          <template #icon><icon-eye /></template>
          查看规格值
        </a-button>
      </template>
    </sa-table>

    <!-- 编辑表单 -->
    <edit-form ref="editRef" @success="refresh" />

    <!-- 规格值查看弹窗 -->
    <a-modal v-model:visible="specValuesVisible" title="规格值详情" width="800px" :footer="false">
      <a-table :data="currentSpecValues" :pagination="false">
        <a-table-column title="规格值名称" data-index="name" />
        <a-table-column title="价格" data-index="price">
          <template #cell="{ record }">
            <span>{{ record.price > 0 ? '+¥' + record.price : '免费' }}</span>
          </template>
        </a-table-column>
        <a-table-column title="排序" data-index="sort" />
        <a-table-column title="状态" data-index="status">
          <template #cell="{ record }">
            <a-tag :color="record.status === '1' ? 'green' : 'red'">
              {{ record.status === '1' ? '启用' : '禁用' }}
            </a-tag>
          </template>
        </a-table-column>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconEye } from '@arco-design/web-vue/es/icon'
import EditForm from './edit.vue'
// import api from '../api/specification' // 注释掉原始 API

// 模拟数据
const mockSpecifications = [
  {
    id: 1,
    category: '1', // 对应字典值
    name: '颜色',
    description: '产品颜色规格，包含多种颜色选项',
    spec_values: [
      { id: 101, name: '红色', price: 0, sort: 1, status: '1' },
      { id: 102, name: '蓝色', price: 5, sort: 2, status: '1' },
      { id: 103, name: '绿色', price: 0, sort: 3, status: '1' },
      { id: 104, name: '黑色', price: 10, sort: 4, status: '1' }
    ],
    sort: 1,
    status: '1',
    create_time: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    category: '2',
    name: '尺寸',
    description: '产品尺寸规格，适用于不同体型',
    spec_values: [
      { id: 201, name: 'S', price: 0, sort: 1, status: '1' },
      { id: 202, name: 'M', price: 0, sort: 2, status: '1' },
      { id: 203, name: 'L', price: 15, sort: 3, status: '1' },
      { id: 204, name: 'XL', price: 25, sort: 4, status: '1' },
      { id: 205, name: 'XXL', price: 35, sort: 5, status: '0' }
    ],
    sort: 2,
    status: '1',
    create_time: '2024-01-16 14:20:00'
  },
  {
    id: 3,
    category: '3',
    name: '材质',
    description: '产品材质规格，影响产品质量和价格',
    spec_values: [
      { id: 301, name: '棉', price: 0, sort: 1, status: '1' },
      { id: 302, name: '涤纶', price: 8, sort: 2, status: '1' },
      { id: 303, name: '丝绸', price: 50, sort: 3, status: '1' },
      { id: 304, name: '羊毛', price: 80, sort: 4, status: '0' }
    ],
    sort: 3,
    status: '1',
    create_time: '2024-01-17 09:15:00'
  },
  {
    id: 4,
    category: '1',
    name: '图案',
    description: '产品图案设计规格',
    spec_values: [
      { id: 401, name: '纯色', price: 0, sort: 1, status: '1' },
      { id: 402, name: '条纹', price: 12, sort: 2, status: '1' },
      { id: 403, name: '印花', price: 20, sort: 3, status: '1' }
    ],
    sort: 4,
    status: '0',
    create_time: '2024-01-18 16:45:00'
  }
];

// 模拟 API 对象
const mockApi = {
  getPageList: (params) => {
    return new Promise(resolve => {
      setTimeout(() => {
        let filteredData = [...mockSpecifications];
        
        // 模拟搜索过滤
        if (params.category) {
          filteredData = filteredData.filter(item => item.category === params.category);
        }
        if (params.name) {
          filteredData = filteredData.filter(item => item.name.includes(params.name));
        }
        if (params.status) {
          filteredData = filteredData.filter(item => item.status === params.status);
        }
        
        // 修正数据格式 - sa-table 期望的格式
        resolve({
          code: 200,
          message: 'success',
          data: {
            data: filteredData,  // 注意这里是 data.data
            total: filteredData.length,
            page: params.page || 1,
            pageSize: params.pageSize || 10
          }
        });
      }, 500);
    });
  },
  
  changeStatus: (params) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const spec = mockSpecifications.find(item => item.id === params.id);
        if (spec) {
          spec.status = params.status;
        }
        resolve({
          code: 200,
          message: '状态修改成功'
        });
      }, 300);
    });
  },
  
  destroy: (params) => {
    return new Promise(resolve => {
      setTimeout(() => {
        // 模拟删除操作
        console.log('模拟删除规格:', params);
        resolve({
          code: 200,
          message: '删除成功'
        });
      }, 300);
    });
  }
};

// 引用定义
const crudRef = ref()
const editRef = ref()
const specValuesVisible = ref(false)
const currentSpecValues = ref([])

// 搜索表单
const searchForm = ref({
  category: '',
  name: '',
  status: '',
  create_time: [],
})

// SaTable 基础配置
const options = reactive({
  api: mockApi.getPageList, // 使用模拟 API
  rowSelection: { showCheckedAll: true },
  add: {
    show: true,
    auth: ['/backend/specification/Specification/save'],
    func: async () => {
      editRef.value?.open()
    },
  },
  edit: {
    show: true,
    auth: ['/backend/specification/Specification/update'],
    func: async (record) => {
      editRef.value?.open('edit')
      editRef.value?.setFormData(record)
    },
  },
  delete: {
    show: true,
    auth: ['/backend/specification/Specification/destroy'],
    func: async (params) => {
      const resp = await mockApi.destroy(params) // 使用模拟 API
      if (resp.code === 200) {
        Message.success(`删除成功！`)
        crudRef.value?.refresh()
      }
    },
  },
})

// SaTable 列配置
const columns = reactive([
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '规格分类', dataIndex: 'category', width: 120, type: 'dict', dict: 'specification_category' },
  { title: '规格名称', dataIndex: 'name', width: 150 },
  { title: '规格描述', dataIndex: 'description', width: 200, ellipsis: true, tooltip: true },
  { title: '规格值', dataIndex: 'spec_values', width: 300, slotName: 'spec_values' },
  { title: '排序', dataIndex: 'sort', width: 80 },
  { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
  { title: '创建时间', dataIndex: 'create_time', width: 180 },
])

// 修改状态
const changeStatus = async (status, id) => {
  const response = await mockApi.changeStatus({ id: id, status: status }) // 使用模拟 API
  if (response.code === 200) {
    Message.success(response.message)
    crudRef.value.refresh()
  }
}

// 查看规格值
const viewSpecValues = (record) => {
  console.log('查看规格值 - record:', record)
  console.log('查看规格值 - spec_values:', record.spec_values)
  
  currentSpecValues.value = record.spec_values || []
  console.log('设置后的 currentSpecValues:', currentSpecValues.value)
  
  specValuesVisible.value = true
}

// 获取标签颜色
const getTagColor = (index) => {
  const colors = ['blue', 'green', 'orange', 'red', 'purple', 'cyan']
  return colors[index % colors.length]
}

// 页面数据初始化
const initPage = async () => {}

// SaTable 数据请求
const refresh = async () => {
  crudRef.value?.refresh()
}

// 页面加载完成执行
onMounted(async () => {
  initPage()
  refresh()
})
</script>

<style scoped>
.mr-1 {
  margin-right: 4px;
}
.mb-1 {
  margin-bottom: 4px;
}
.ml-1 {
  margin-left: 4px;
}
</style>