import { request } from '@/utils/request.js'

/**
 * 订单管理 API接口
 */
export default {

  /**
   * 数据列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: '/backend/order/Order/index',
      method: 'get',
      params
    })
  },

  /**
   * 添加数据
   * @returns
   */
  save(params = {}) {
    return request({
      url: '/backend/order/Order/save',
      method: 'post',
      data: params
    })
  },

  /**
   * 更新数据
   * @returns
   */
  update(id, data = {}) {
    return request({
      url: '/backend/order/Order/update?id=' + id,
      method: 'put',
      data
    })
  },

  /**
   * 读取数据
   * @returns
   */
  read(id) {
    return request({
      url: '/backend/order/Order/read?id=' + id,
      method: 'get'
    })
  },

  /**
   * 删除数据
   * @returns
   */
  destroy(data) {
    return request({
      url: '/backend/order/Order/destroy',
      method: 'delete',
      data
    })
  },

  /**
   * 获取订单项详情
   * @returns
   */
  getOrderItems(orderId) {
    return request({
      url: '/backend/order/Order/getItemsByOrderId?orderId=' + orderId,
      method: 'get'
    })
  },
  /**
   * 中通物流发货
   */
  handleShipping(data){
    return request({
      url: '/backend/order/Order/handleShipping',
      method: 'post',
      data
    })
  },
  /**
   * 添加数据
   * @returns
   */
  export(params = {}) {
    return request({
      url: '/backend/order/Order/export',
      method: 'post',
      data: params,
      responseType: 'blob'
    })
  },
  // 获取订单统计数据
  getOrderStatistics(params) {
    return request({
      url: '/backend/order/Order/orderStatistics',
      method: 'get',
      params
    })
  },



  // 获取销售额统计数据
  getSalesStatistics(params) {
    return request({
      url: '/backend/order/Order/getSalesStatistics',
      method: 'get',
      params
    })
  },




}