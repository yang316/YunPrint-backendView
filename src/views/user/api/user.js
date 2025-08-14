import { request } from '@/utils/request.js'

/**
 * 用户管理 API接口
 */
export default {

  /**
   * 数据列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: '/backend/user/User/index',
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
      url: '/backend/user/User/save',
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
      url: '/backend/user/User/update?id=' + id,
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
      url: '/backend/user/User/read?id=' + id,
      method: 'get'
    })
  },

  /**
   * 删除数据
   * @returns
   */
  destroy(data) {
    return request({
      url: '/backend/user/User/destroy',
      method: 'delete',
      data
    })
  },

  /**
   * 状态切换
   * @returns
   */
  changeStatus(data) {
    return request({
      url: '/backend/user/User/changeStatus',
      method: 'put',
      data
    })
  },

  // 获取用户增长统计数据
  getUserGrowthStatistics(params) {
    return request({
      url: '/backend/user/User/userGrowthStatistics',
      method: 'get',
      params
    })
  }
}