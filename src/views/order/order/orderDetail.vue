<template>
  <a-modal :visible="visible" @update:visible="handleVisibleChange" title="订单详情" :width="900" :footer="false"
    @cancel="handleCancel">
    <div v-if="flattenedOrderItems.length > 0">
      <!-- 按规格组合分组显示 -->
      <div v-for="(group, groupKey) in orderItems" :key="groupKey" style="margin-bottom: 32px;">
        <!-- 优化后的规格组合标题 -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <div style="width: 4px; height: 24px; background: #fff; border-radius: 2px; margin-right: 12px;"></div>
              <h3 style="color: #fff; margin: 0; font-size: 18px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                规格组合
              </h3>
            </div>
            <div style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; backdrop-filter: blur(10px);">
              <span style="color: #fff; font-size: 14px; font-weight: 500;">{{ group.length }} 个文件</span>
            </div>
          </div>
          <div style="margin-top: 12px; padding: 12px 16px; background: rgba(255,255,255,0.1); border-radius: 8px; backdrop-filter: blur(5px);">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <a-tag v-for="(spec, specIndex) in groupKey.split(',')" :key="specIndex" 
                style="background: rgba(255,255,255,0.9); color: #4a5568; border: none; border-radius: 6px; padding: 4px 12px; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                {{ spec.trim() }}
              </a-tag>
            </div>
          </div>
        </div>
        
        <a-card v-for="(item, index) in group" :key="item.id" :title="`文件 ${index + 1}: ${item.fileName}`"
          style="margin-bottom: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <!-- 基本信息 -->
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
            <a-descriptions-item label="打印页数">
              {{ item.selectPage.start }} - {{ item.selectPage.end }}
            </a-descriptions-item>
          </a-descriptions>

          <!-- 所有规格选项 -->
          <div style="margin-top: 16px;">
            <h4 style="margin-bottom: 12px; color: #1d2129; font-weight: 600;">完整规格选项</h4>
            <div v-if="item.allKeys && item.allKeys.length > 0"
              style="background: #f7f8fa; padding: 16px; border-radius: 6px;">
              <a-space wrap :size="[12, 8]">
                <div v-for="(option, optionIndex) in item.allKeys" :key="optionIndex"
                  style="display: flex; align-items: center; background: white; padding: 8px 12px; border-radius: 4px; border: 1px solid #e5e6eb; cursor: pointer;"
                  @click="copySpecOptions(item.allKeys)" :title="'点击复制所有规格选项'">
                  <a-tag :color="getRandomColor(optionIndex)" style="margin: 0; border-radius: 4px;">
                    {{ option }}
                  </a-tag>
                </div>
              </a-space>
              <!-- 复制按钮 -->
              <div style="margin-top: 12px; text-align: right;">
                <a-button size="small" type="outline" @click="copySpecOptions(item.allKeys)">
                  <template #icon><icon-copy /></template>
                  复制规格选项
                </a-button>
              </div>
            </div>
          </div>

          <!-- 封面内容展示 -->
          <div v-if="item.coverText || item.coverUrl" style="margin-top: 16px;">
            <h4 style="margin-bottom: 12px; color: #1d2129; font-weight: 600;">封面内容</h4>

            <!-- 文字封面内容 -->
            <div v-if="item.coverText" style="margin-bottom: 12px;">
              <div style="color: #1d2129; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center;">
                <a-tag color="orange" style="margin-right: 8px;">封面文字</a-tag>
              </div>
              <div
                style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e6eb; color: #4e5969; line-height: 1.5;">
                {{ item.coverText }}
              </div>
            </div>

            <!-- 图片封面展示 -->
            <div v-if="item.coverUrl">
              <div style="color: #1d2129; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center;">
                <a-tag color="purple" style="margin-right: 8px;">封面图片</a-tag>
              </div>
              <div
                style="background: white; padding: 12px; border-radius: 4px; border: 1px solid #e5e6eb; text-align: center; overflow: hidden;">
                <a-image :src="item.coverUrl"
                  style="max-width: 100%; max-height: 200px; width: auto; height: auto; border-radius: 4px; object-fit: contain;"
                  :preview="true" />
              </div>
            </div>
          </div>
        </a-card>
      </div>
    </div>
    <a-empty v-else description="暂无订单项数据" />
  </a-modal>
</template>

<script setup>
import { computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCopy } from '@arco-design/web-vue/es/icon'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  orderItems: {
    type: Object, // 改为 Object 类型
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:visible'])

// 计算属性：将对象格式的数据扁平化为数组，用于判断是否有数据
const flattenedOrderItems = computed(() => {
  const items = []
  Object.values(props.orderItems).forEach(group => {
    if (Array.isArray(group)) {
      items.push(...group)
    }
  })
  return items
})

// 处理弹窗显示状态变化
const handleVisibleChange = (newVisible) => {
  emit('update:visible', newVisible)
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
}

// 获取随机颜色
const getRandomColor = (index) => {
  const colors = [
    'blue', 'green', 'orange', 'red', 'purple', 'cyan',
    'magenta', 'gold', 'lime', 'arcoblue', 'gray', 'pinkpurple'
  ]
  return colors[index % colors.length]
}

// 复制规格选项
const copySpecOptions = async (allKeys) => {
  if (!allKeys || allKeys.length === 0) {
    Message.warning('暂无规格选项可复制')
    return
  }

  try {
    const textToCopy = allKeys.join(' ')
    await navigator.clipboard.writeText(textToCopy)
    Message.success(`已复制规格选项: ${textToCopy}`)
  } catch (error) {
    // 降级方案：使用传统的复制方法
    const textArea = document.createElement('textarea')
    textArea.value = allKeys.join(' ')
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      Message.success(`已复制规格选项: ${allKeys.join(' ')}`)
    } catch (fallbackError) {
      Message.error('复制失败，请手动复制')
    }
    document.body.removeChild(textArea)
  }
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
    'coverType': 'purple',
    'coverColor': 'red',
    'multiPage': 'lime'
  }
  return colorMap[optionType] || 'blue'
}
</script>