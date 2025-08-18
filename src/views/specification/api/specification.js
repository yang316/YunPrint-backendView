import { request } from '@/utils/request.js'

/**
 * 规格设置 API接口
 */
export default {

  /**
   * 数据列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: '/backend/PrintSku/PrintSku/index',
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
      url: '/backend/PrintSku/PrintSku/save',
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
      url: '/backend/PrintSku/PrintSku/update?id=' + id,
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
      url: '/backend/PrintSku/PrintSku/read?id=' + id,
      method: 'get'
    })
  },

  /**
   * 删除数据
   * @returns
   */
  destroy(data) {
    return request({
      url: '/backend/PrintSku/PrintSku/destroy',
      method: 'delete',
      data
    })
  },

  /**
   * 修改状态
   */
  changeStatus(data) {
    return request({
      url: '/backend/PrintSku/PrintSku/changestatus',
      method: 'post',
      data
    })
  },

  /**
   * 获取规格
   */
  getSpecList() {
    return request({
      url: '/backend/PrintSku/PrintSku/getSpecPrice',
      method: 'get'
    })
  },

  /**
   * 更新组合定价
   * @param {*} data  组合定价数据
   * @returns 
   */
  updateCombinationPrices(params = {}) {
    return request({
      url: '/backend/PrintSku/PrintSku/saveCombinationsToDb',
      method: 'post',
      data: params,

    })
  }





}