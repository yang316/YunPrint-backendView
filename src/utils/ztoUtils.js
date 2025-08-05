/**
 * 中通物流工具类
 */
import CryptoJS from 'crypto-js'
import { ZTO_CONFIG } from '@/config/shipping'

/**
 * 生成中通API签名
 * @param {Object} data 请求数据
 * @param {string} timestamp 时间戳
 * @returns {string} 签名
 */
export const generateZTOSignature = (data, timestamp) => {
  // 将数据按key排序
  const sortedKeys = Object.keys(data).sort()
  let signStr = ''
  
  sortedKeys.forEach(key => {
    if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
      signStr += `${key}=${data[key]}&`
    }
  })
  
  // 添加时间戳和密钥
  signStr += `timestamp=${timestamp}&key=${ZTO_CONFIG.partnerKey}`
  
  // 生成MD5签名
  return CryptoJS.MD5(signStr).toString().toUpperCase()
}

/**
 * 格式化发货地址
 * @param {Object} address 地址对象
 * @returns {string} 格式化后的地址
 */
export const formatAddress = (address) => {
  const { province, city, district, address: detail } = address
  return `${province}${city}${district}${detail}`
}

/**
 * 生成订单号（如果没有提供）
 * @returns {string} 订单号
 */
export const generateOrderNo = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `YP${timestamp}${random}`
}

/**
 * 验证手机号格式
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 构建中通电子面单请求数据
 * @param {Object} orderData 订单数据
 * @returns {Object} 请求数据
 */
export const buildZTOWaybillData = (orderData) => {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  
  const data = {
    partnerId: ZTO_CONFIG.partnerId,
    orderNo: orderData.order_sn || generateOrderNo(),
    senderName: ZTO_CONFIG.sender.name,
    senderPhone: ZTO_CONFIG.sender.phone,
    senderProvince: ZTO_CONFIG.sender.province,
    senderCity: ZTO_CONFIG.sender.city,
    senderDistrict: ZTO_CONFIG.sender.district,
    senderAddress: ZTO_CONFIG.sender.address,
    receiverName: orderData.receiver.name,
    receiverPhone: orderData.receiver.phone,
    receiverProvince: orderData.receiver.province,
    receiverCity: orderData.receiver.city,
    receiverDistrict: orderData.receiver.district,
    receiverAddress: orderData.receiver.address,
    goodsName: orderData.goods.description || '打印文件',
    goodsWeight: orderData.goods.weight || 0.5,
    remark: orderData.remark || '',
    timestamp: timestamp
  }
  
  // 生成签名
  data.sign = generateZTOSignature(data, timestamp)
  
  return data
}

/**
 * 解析中通API响应
 * @param {Object} response API响应
 * @returns {Object} 解析后的数据
 */
export const parseZTOResponse = (response) => {
  if (response.status !== 'success') {
    throw new Error(response.message || '中通API调用失败')
  }
  
  return {
    waybillNo: response.data.waybillNo,
    orderNo: response.data.orderNo,
    status: response.data.status,
    message: response.message
  }
}

export default {
  generateZTOSignature,
  formatAddress,
  generateOrderNo,
  validatePhone,
  buildZTOWaybillData,
  parseZTOResponse
}