/**
 * 中通物流电子面单API
 */
import { request } from '@/utils/request'
import { buildZTOWaybillData, parseZTOResponse, validatePhone } from '@/utils/ztoUtils'
import { ZTO_CONFIG } from '@/config/shipping'

/**
 * 创建中通物流电子面单
 * @param {Object} data 发货数据
 * @returns {Promise}
 */
export const createZTOWaybill = async (data) => {
  // 验证必要字段
  if (!data.receiver.name || !data.receiver.phone || !data.receiver.address) {
    throw new Error('收货人信息不完整')
  }
  
  // 验证手机号格式
  if (!validatePhone(data.receiver.phone)) {
    throw new Error('收货人手机号格式不正确')
  }
  
  try {
    // 构建中通API请求数据
    const ztoData = buildZTOWaybillData(data)
    
    // 调用后端API（后端会调用中通接口）
    const response = await request({
      url: '/api/shipping/zto/create',
      method: 'post',
      data: {
        order_id: data.order_id,
        order_sn: data.order_sn,
        zto_data: ztoData,
        receiver: data.receiver,
        goods: data.goods,
        remark: data.remark
      }
    })
    
    return response
  } catch (error) {
    console.error('创建中通电子面单失败:', error)
    throw error
  }
}

/**
 * 查询快递单号状态
 * @param {string} waybillNo 快递单号
 * @returns {Promise}
 */
export const queryWaybillStatus = (waybillNo) => {
  return request({
    url: '/api/shipping/zto/query',
    method: 'get',
    params: {
      waybill_no: waybillNo
    }
  })
}

/**
 * 获取订单的物流信息
 * @param {number} orderId 订单ID
 * @returns {Promise}
 */
export const getOrderShipping = (orderId) => {
  return request({
    url: `/api/shipping/order/${orderId}`,
    method: 'get'
  })
}

/**
 * 取消快递单
 * @param {string} waybillNo 快递单号
 * @returns {Promise}
 */
export const cancelWaybill = (waybillNo) => {
  return request({
    url: '/api/shipping/zto/cancel',
    method: 'post',
    data: {
      waybill_no: waybillNo
    }
  })
}

export default {
  createZTOWaybill,
  queryWaybillStatus,
  getOrderShipping,
  cancelWaybill
}