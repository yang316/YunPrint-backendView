<template>
  <a-modal :visible="visible" @update:visible="handleVisibleChange" title="订单详情" :width="900" :footer="false"
    @cancel="handleCancel">
    <!-- 订单号显示区域 -->
    <div v-if="orderNo"
      style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; box-shadow: 0 4px 12px rgba(240, 147, 251, 0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4 style="margin: 0; color: #fff; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">订单号</h4>
          <p
            style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px; font-weight: 500; font-family: 'Courier New', monospace;">
            {{ orderNo }}</p>
        </div>
        <a-button type="primary" size="small" @click="copyOrderNo"
          style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: #fff; backdrop-filter: blur(10px);">
          <template #icon><icon-copy /></template>
          复制订单号
        </a-button>
      </div>
    </div>

    <!-- 全局操作栏 -->
    <div v-if="flattenedOrderItems.length > 0"
      style="margin-bottom: 24px; padding: 16px; background: #f7f8fa; border-radius: 8px; border: 1px solid #e5e6eb;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4 style="margin: 0; color: #1d2129; font-weight: 600;">订单文件总览</h4>
          <p style="margin: 4px 0 0 0; color: #86909c; font-size: 14px;">共 {{ Object.keys(orderItems).length }} 个规格组合，{{
            flattenedOrderItems.length }} 个文件</p>
        </div>
        <a-button type="primary" size="large" @click="downloadAllFiles" :loading="downloadingAll"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
          <template #icon><icon-download /></template>
          打包下载全部文件
        </a-button>
      </div>
    </div>

    <div v-if="flattenedOrderItems.length > 0">
      <!-- 按规格组合分组显示 -->
      <div v-for="(group, groupKey) in orderItems" :key="groupKey" style="margin-bottom: 32px;">
        <!-- 优化后的规格组合标题 -->
        <div
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <div style="width: 4px; height: 24px; background: #fff; border-radius: 2px; margin-right: 12px;"></div>
              <h3
                style="color: #fff; margin: 0; font-size: 18px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
                规格组合
              </h3>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <!-- 打包下载按钮 -->
              <a-button type="primary" size="small"
                style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: #fff; backdrop-filter: blur(10px);"
                @click="downloadGroupFiles(group, groupKey)" :loading="downloadingGroups[groupKey]">
                <template #icon><icon-download /></template>
                打包下载
              </a-button>
              <div
                style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; backdrop-filter: blur(10px);">
                <span style="color: #fff; font-size: 14px; font-weight: 500;">{{ group.length }} 个文件</span>
              </div>
            </div>
          </div>
          <div
            style="margin-top: 12px; padding: 12px 16px; background: rgba(255,255,255,0.1); border-radius: 8px; backdrop-filter: blur(5px);">
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
import { computed, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconCopy, IconDownload } from '@arco-design/web-vue/es/icon'
import JSZip from 'jszip'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  orderItems: {
    type: Object, // 改为 Object 类型
    default: () => ({})
  },
  orderNo: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:visible'])

// 下载状态管理
const downloadingGroups = ref({})
const downloadingAll = ref(false)

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

// 处理文件名编码问题的辅助函数
const fixFilenameEncoding = (filename) => {
  if (!filename) return '未命名文件'
  
  let result = filename
  
  // 尝试多种解码方式
  try {
    // 检测是否包含乱码字符
    if (/[\uFFFD\u00A0-\u9999]/.test(filename)) {
      // 方法1: 尝试UTF-8解码
      try {
        const decoded = decodeURIComponent(escape(filename))
        if (decoded && decoded !== filename) {
          result = decoded
        }
      } catch (e) {
        console.warn('UTF-8解码失败', e)
      }
      
      // 方法2: 尝试URL解码
      if (/[\uFFFD\u00A0-\u9999]/.test(result)) {
        try {
          const decoded = decodeURIComponent(filename)
          if (decoded && decoded !== filename) {
            result = decoded
          }
        } catch (e) {
          console.warn('URL解码失败', e)
        }
      }
      
      // 方法3: 如果仍有乱码，尝试直接替换常见乱码模式
      if (/[\uFFFD\u00A0-\u9999]/.test(result)) {
        // 创建一个安全的文件名 - 移除或替换不可读字符
        result = filename
          .replace(/[\uFFFD]/g, '') // 移除替换字符
          .replace(/[^\x20-\x7E\u4E00-\u9FFF]/g, '_') // 保留ASCII和中文字符，其他替换为下划线
      }
    }
  } catch (e) {
    console.warn('文件名解码失败，使用原始文件名', e)
  }
  
  return result
}

// 下载文件为Blob
const downloadFileAsBlob = async (url, filename) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const blob = await response.blob()
    
    // 处理可能的文件名编码问题
    const decodedFilename = fixFilenameEncoding(filename)
    
    return { blob, filename: decodedFilename }
  } catch (error) {
    console.error(`下载文件失败: ${filename}`, error)
    throw error
  }
}

// 打包下载组合文件
const downloadGroupFiles = async (group, groupKey) => {
  if (!group || group.length === 0) {
    Message.warning('该组合下暂无文件可下载')
    return
  }

  // 设置下载状态
  downloadingGroups.value[groupKey] = true

  try {
    const zip = new JSZip()
    const downloadPromises = []

    // 为每个文件创建下载任务
    group.forEach((item, index) => {
      if (item.fileUrl && item.fileName) {
        const promise = downloadFileAsBlob(item.fileUrl, item.fileName)
          .then(({ blob, filename }) => {
            // 避免文件名重复，添加序号
            const copies = item.copies || 1
            
            // 确保文件名有效
            let safeFilename = filename
            
            // 如果处理后文件名为空，使用默认文件名
            if (!safeFilename || !safeFilename.trim()) {
              safeFilename = `文件_${index + 1}.pdf`
            }
            
            // 添加份数信息
            const finalFilename = group.length > 1 ? `${copies}份_${safeFilename}` : `${copies}份_${safeFilename}`
            zip.file(finalFilename, blob)
          })
          .catch(error => {
            console.error(`文件下载失败: ${item.fileName}`, error)
            Message.warning(`文件 ${item.fileName} 下载失败，将跳过`)
          })
        downloadPromises.push(promise)
      }
    })

    // 等待所有文件下载完成
    await Promise.allSettled(downloadPromises)

    // 检查是否有文件成功添加到zip
    const fileNames = Object.keys(zip.files)
    if (fileNames.length === 0) {
      Message.error('没有文件可以打包下载')
      return
    }

    // 生成zip文件
    const zipBlob = await zip.generateAsync({ type: 'blob' })

    // 创建下载链接
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url

    // 生成文件名：规格组合_份数_时间戳.zip
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')

    const zipFileName = `${groupKey.replace(/[,\s]/g, '_')}_${timestamp}.zip`
    link.download = zipFileName

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理URL对象
    URL.revokeObjectURL(url)

    Message.success(`成功打包下载 ${fileNames.length} 个文件`)

  } catch (error) {
    console.error('打包下载失败:', error)
    Message.error('打包下载失败，请稍后重试')
  } finally {
    // 清除下载状态
    downloadingGroups.value[groupKey] = false
  }
}

// 打包下载所有文件（按规格组合分文件夹）
const downloadAllFiles = async () => {
  if (!props.orderItems || Object.keys(props.orderItems).length === 0) {
    Message.warning('暂无文件可下载')
    return
  }

  // 设置下载状态
  downloadingAll.value = true

  try {
    const zip = new JSZip()
    const allDownloadPromises = []
    let totalFiles = 0

    // 遍历每个规格组合
    for (const [groupKey, group] of Object.entries(props.orderItems)) {
      if (!Array.isArray(group) || group.length === 0) continue

      // 为每个规格组合创建文件夹（添加份数信息）
      // 获取该组合的份数（假设组内所有项目份数相同，取第一个）
      const copies = group[0]?.copies || 1
      const folderName = `${groupKey.replace(/[,\s]/g, '_').replace(/[<>:"/\\|?*]/g, '_')}_${copies}份`
      const folder = zip.folder(folderName)

      // 为该组合下的每个文件创建下载任务
      group.forEach((item, index) => {
        if (item.fileUrl && item.fileName) {
          totalFiles++
          const promise = downloadFileAsBlob(item.fileUrl, item.fileName)
            .then(({ blob, filename }) => {
// 避免文件名重复，添加序号

              // 在文件名中添加份数信息
              const copies = item.copies || 1
              
              // 确保文件名有效
               let safeFilename = filename
               
               // 如果处理后文件名为空，使用默认文件名
               if (!safeFilename || !safeFilename.trim()) {
                 safeFilename = `文件_${index + 1}.pdf`
               }
              
              // 添加份数信息
              const finalFilename = group.length > 1 ? `${copies}份_${safeFilename}` : `${copies}份_${safeFilename}`
              folder.file(finalFilename, blob)
            })
            .catch(error => {
              console.error(`文件下载失败: ${item.fileName}`, error)
              Message.warning(`文件 ${item.fileName} 下载失败，将跳过`)
            })
          allDownloadPromises.push(promise)
        }
      })
    }

    if (totalFiles === 0) {
      Message.warning('没有有效的文件可以下载')
      return
    }

    // 等待所有文件下载完成
    await Promise.allSettled(allDownloadPromises)

    // 检查是否有文件成功添加到zip
    const hasFiles = Object.keys(zip.files).some(path => !path.endsWith('/'))
    if (!hasFiles) {
      Message.error('没有文件成功下载，无法创建压缩包')
      return
    }

    // 生成zip文件
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })
    
    // 创建下载链接
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    
    // 生成文件名：订单号_订单文件_时间戳.zip
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
    // const orderNoPrefix = props.orderNo ? `${props.orderNo}_` : ''
    const zipFileName = `订单文件_${timestamp}.zip`
    link.download = zipFileName
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    const successCount = Object.keys(zip.files).filter(path => !path.endsWith('/')).length
    Message.success(`成功打包下载 ${Object.keys(props.orderItems).length} 个规格组合，共 ${successCount} 个文件`)
    
  } catch (error) {
    console.error('全部打包下载失败:', error)
    Message.error('打包下载失败，请稍后重试')
  } finally {
    // 清除下载状态
    downloadingAll.value = false
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

// 复制订单号
const copyOrderNo = async () => {
  if (!props.orderNo) {
    Message.warning('暂无订单号可复制')
    return
  }

  try {
    await navigator.clipboard.writeText(props.orderNo)
    Message.success(`已复制订单号: ${props.orderNo}`)
  } catch (error) {
    // 降级方案：使用传统的复制方法
    const textArea = document.createElement('textarea')
    textArea.value = props.orderNo
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      Message.success(`已复制订单号: ${props.orderNo}`)
    } catch (fallbackError) {
      Message.error('复制失败，请手动复制')
    }
    document.body.removeChild(textArea)
  }
}
</script>