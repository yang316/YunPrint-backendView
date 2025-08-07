import { request } from '@/utils/request.js'

/**
 * 订单评论管理 API接口
 */
export default {

  /**
   * 数据列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: '/backend/OrderComment/OrderComment/index',
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
      url: '/backend/OrderComment/OrderComment/save',
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
      url: '/backend/OrderComment/OrderComment/update?id=' + id,
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
      url: '/backend/OrderComment/OrderComment/read?id=' + id,
      method: 'get'
    })
  },

  /**
   * 删除数据
   * @returns
   */
  destroy(data) {
    return request({
      url: '/backend/OrderComment/OrderComment/destroy',
      method: 'delete',
      data
    })
  },

  /**
   * 修改状态
   * @returns
   */
  changeStatus(data) {
    return request({
      url: '/backend/OrderComment/OrderComment/changestatus',
      method: 'post',
      data
    })
  },

}