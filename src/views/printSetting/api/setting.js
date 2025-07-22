import { request } from '@/utils/request.js'

/**
 * 打印设置 API接口
 */
export default {

  /**
   * 数据列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: '/backend/printSetting/PrintSetting/index',
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
      url: '/backend/printSetting/PrintSetting/save',
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
      url: '/backend/printSetting/PrintSetting/update?id=' + id,
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
      url: '/backend/printSetting/PrintSetting/read?id=' + id,
      method: 'get'
    })
  },

  /**
   * 删除数据
   * @returns
   */
  destroy(data) {
    return request({
      url: '/backend/printSetting/PrintSetting/destroy',
      method: 'delete',
      data
    })
  },
  /**
   * 修改状态
   */
  changeStatus(data){
    return request({
      url: '/backend/printSetting/PrintSetting/changestatus',
      method: 'post',
      data
    })
  }
}