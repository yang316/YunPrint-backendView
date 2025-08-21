<template>
  <a-modal 
    :visible="visible" 
    @update:visible="handleVisibleChange"
    title="订单详情" 
    :width="800" 
    :footer="false" 
    @cancel="handleCancel"
  >
    <div v-if="orderItems.length > 0">
      <a-card v-for="(item, index) in orderItems" :key="item.id" :title="`文件 ${index + 1}: ${item.fileName}`"
        style="margin-bottom: 16px;">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="文件名">
            <a-link :href="item.fileUrl" :download="item.fileName" target="_blank">
              {{ item.fileName }}
            </a-link>
          </a-descriptions-item>
          <a-descriptions-item label="总页数">
            {{ item.totalPage }}
          </a-descriptions-item>
          <a-descriptions-item label="份数">
            {{ item.copies }}
          </a-descriptions-item>
          <a-descriptions-item label="总价">
            ¥{{ item.totalPrice }}
          </a-descriptions-item>
          <a-descriptions-item label="打印页数">
            {{ item.selectPage.start }} - {{ item.selectPage.end }}
          </a-descriptions-item>
        </a-descriptions>

        <!-- 打印规格 -->
        <div style="margin-top: 16px;">
          <h4 style="margin-bottom: 12px; color: #1d2129; font-weight: 600;">打印规格</h4>
          <div v-if="item.skuInfo && item.skuInfo.length > 0"
            style="background: #f7f8fa; padding: 16px; border-radius: 6px;">
            <a-space wrap :size="[12, 8]">
              <div v-for="sku in item.skuInfo" :key="sku.id"
                style="display: flex; align-items: center; background: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #e5e6eb;">
                <a-tag :color="getOptionColor(sku.sku_id)" style="margin: 0; margin-right: 8px; border-radius: 4px;">
                  {{ sku.name }}
                </a-tag>
              </div>
            </a-space>
          </div>
          <a-empty v-else description="暂无打印选项" size="small" style="margin: 20px 0;" />
        </div>

        <!-- 打印选项 -->
        <div style="margin-top: 16px;">
          <h4 style="margin-bottom: 12px; color: #1d2129; font-weight: 600;">装订选项</h4>
          <div v-if="item.options && item.options.length > 0"
            style="background: #f7f8fa; padding: 16px; border-radius: 6px;">
            <a-space wrap :size="[12, 8]">
              <div v-for="option in item.options" :key="option.type"
                style="display: flex; align-items: center; background: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #e5e6eb;">
                <a-tag :color="getOptionColor(option.type)" style="margin: 0; margin-right: 8px; border-radius: 4px;">
                  {{ option.name }}
                </a-tag>
              </div>
            </a-space>

            <!-- 特殊内容展示 - 只有当装订选项满足条件时才显示 -->
            <div v-if="(item.coverText || item.coverUrl) && !shouldHideSpecialContent(item.options)"
              style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e6eb;">
              <!-- 文字封面内容 -->
              <div v-if="item.coverText" style="margin-bottom: 12px;">
                <div
                  style="color: #1d2129; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center;">
                  <a-tag color="orange" style="margin-right: 8px;">封面文字</a-tag>
                </div>
                <div
                  style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e6eb; color: #4e5969; line-height: 1.5;">
                  {{ item.coverText }}
                </div>
              </div>

              <!-- 图片封面展示 -->
              <div v-if="item.coverUrl">
                <div
                  style="color: #1d2129; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center;">
                  <a-tag color="purple" style="margin-right: 8px;">封面图片</a-tag>
                </div>
                <div
                  style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e6eb; text-align: center; overflow: hidden;">
                  <a-image :src="item.coverUrl"
                    style="max-width: 100%; max-height: 100%; width: auto; height: auto; border-radius: 4px; object-fit: contain;"
                    :preview="true" />
                </div>
              </div>
            </div>
          </div>
          <a-empty v-else description="暂无打印选项" size="small" style="margin: 20px 0;" />
        </div>
      </a-card>
    </div>
    <a-empty v-else description="暂无订单项数据" />
  </a-modal>
</template>

<script setup>
// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  orderItems: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:visible'])

// 处理弹窗显示状态变化
const handleVisibleChange = (newVisible) => {
  emit('update:visible', newVisible)
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
}

// 判断是否应该隐藏特殊内容
const shouldHideSpecialContent = (options) => {
  if (!options || options.length === 0) return false
  
  return options.some(option => 
    option.name === '不装钉' || option.name !== '订书钉'
  )
}

// 获取选项颜色
const getOptionColor = (optionType) => {
  const colorMap = {
    'paperSize': 'blue',
    'paperType': 'green',
    'printSide': 'cyan',
    'printColor': 'magenta',
    'binding': 'gold',
    'coverContent': 'orange',
    'orientation': 'purple',
    'quality': 'red',
    'copies': 'lime',
    1: 'orange',
    4: 'purple',
    5: 'red',
    6: 'lime',
  }
  return colorMap[optionType] || 'blue'
}
</script>