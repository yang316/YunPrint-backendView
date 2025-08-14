import { request } from '@/utils/request.js'

/**
 * 用户余额记录 API接口
 */
export default {

  /**
   * 数据列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: '/backend/AmountLog/AmountLog/index',
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
      url: '/backend/AmountLog/AmountLog/save',
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
      url: '/backend/AmountLog/AmountLog/update?id=' + id,
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
      url: '/backend/AmountLog/AmountLog/read?id=' + id,
      method: 'get'
    })
  },

  /**
   * 删除数据
   * @returns
   */
  destroy(data) {
    return request({
      url: '/backend/AmountLog/AmountLog/destroy',
      method: 'delete',
      data
    })
  },

  /**
   * 审核提现申请
   * @param {Object} data 审核数据
   * @returns
   */
  audit(data = {}) {
    return request({
      url: '/backend/AmountLog/AmountLog/audit',
      method: 'post',
      data
    })
  },
  // 获取佣金支出统计数据
  getCommissionStatistics(params) {
    return request({
      url: '/backend/AmountLog/AmountLog/commissionStatistics',
      method: 'get',
      params
    })
  }
}