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
      url: '/backend/specification/Specification/index',
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
      url: '/backend/specification/Specification/save',
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
      url: '/backend/specification/Specification/update?id=' + id,
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
      url: '/backend/specification/Specification/read?id=' + id,
      method: 'get'
    })
  },

  /**
   * 删除数据
   * @returns
   */
  destroy(data) {
    return request({
      url: '/backend/specification/Specification/destroy',
      method: 'delete',
      data
    })
  },

  /**
   * 修改状态
   */
  changeStatus(data) {
    return request({
      url: '/backend/specification/Specification/changestatus',
      method: 'post',
      data
    })
  },

  /**
   * 获取规格分类
   */
  getCategories() {
    return request({
      url: '/backend/specification/Specification/categories',
      method: 'get'
    })
  },

  /**
   * 获取所有规格用于组合
   */
  getAllSpecs() {
    // 返回模拟数据用于测试
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: {
        specs: [
          {
            id: 1,
            name: '纸张类型',
            values: [
              { id: 1, name: '普通纸', base_price: 0.10 },
              { id: 2, name: '铜版纸', base_price: 0.15 },
              { id: 3, name: '哑粉纸', base_price: 0.18 },
              { id: 4, name: '艺术纸', base_price: 0.25 }
            ]
          },
          {
            id: 2,
            name: '打印颜色',
            values: [
              { id: 5, name: '黑白', base_price: 0.05 },
              { id: 6, name: '彩色', base_price: 0.20 },
              { id: 7, name: '专色', base_price: 0.35 }
            ]
          },
          {
            id: 3,
            name: '纸张尺寸',
            values: [
              { id: 8, name: 'A4', base_price: 0.00 },
              { id: 9, name: 'A3', base_price: 0.10 },
              { id: 10, name: 'A5', base_price: -0.05 },
              { id: 11, name: '自定义', base_price: 0.15 }
            ]
          },
          {
            id: 4,
            name: '装订方式',
            values: [
              { id: 12, name: '无装订', base_price: 0.00 },
              { id: 13, name: '骑马钉', base_price: 0.08 },
              { id: 14, name: '胶装', base_price: 0.15 },
              { id: 15, name: '精装', base_price: 0.30 }
            ]
          }
        ]
      }
    })
  },

  /**
   * 保存规格组合价格
   */
  saveCombinationPrices(data) {
    // 模拟保存成功
    console.log('保存组合价格:', data)
    return Promise.resolve({
      code: 200,
      message: '保存成功',
      data: null
    })
  },

  /**
   * 获取规格组合价格
   */
  getCombinationPrices(params = {}) {
    return request({
      url: '/backend/specification/Specification/combination-prices',
      method: 'get',
      params
    })
  },

  /**
   * 根据规格组合获取价格
   */
  getPriceBySpecs(specs) {
    // 返回模拟的组合价格数据
    const mockCombinations = [
      {
        spec_combination: '1,5,8,12',
        combination_name: '普通纸-黑白-A4-无装订',
        base_price: 0.15,
        combination_price: 0.12
      },
      {
        spec_combination: '2,6,8,13',
        combination_name: '铜版纸-彩色-A4-骑马钉',
        base_price: 0.43,
        combination_price: 0.38
      },
      {
        spec_combination: '4,7,9,15',
        combination_name: '艺术纸-专色-A3-精装',
        base_price: 1.00,
        combination_price: 0.85
      },
      {
        spec_combination: '3,6,10,14',
        combination_name: '哑粉纸-彩色-A5-胶装',
        base_price: 0.48,
        combination_price: 0.45
      },
      {
        spec_combination: '1,6,11,12',
        combination_name: '普通纸-彩色-自定义-无装订',
        base_price: 0.45,
        combination_price: 0.42
      }
    ]
    
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: {
        combinations: mockCombinations
      }
    })
  },

  /**
   * 获取模拟的规格类型数据
   */
  getMockSpecTypes() {
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: {
        list: [
          {
            id: 1,
            name: '纸张类型',
            sort: 1,
            status: 1,
            created_time: '2024-01-15 10:00:00'
          },
          {
            id: 2,
            name: '打印颜色',
            sort: 2,
            status: 1,
            created_time: '2024-01-15 10:05:00'
          },
          {
            id: 3,
            name: '纸张尺寸',
            sort: 3,
            status: 1,
            created_time: '2024-01-15 10:10:00'
          },
          {
            id: 4,
            name: '装订方式',
            sort: 4,
            status: 1,
            created_time: '2024-01-15 10:15:00'
          }
        ],
        total: 4
      }
    })
  },

  /**
   * 获取模拟的规格值数据
   */
  getMockSpecValues(spec_type_id) {
    const allValues = {
      1: [ // 纸张类型
        { id: 1, spec_type_id: 1, name: '普通纸', base_price: 0.10, sort: 1, status: 1 },
        { id: 2, spec_type_id: 1, name: '铜版纸', base_price: 0.15, sort: 2, status: 1 },
        { id: 3, spec_type_id: 1, name: '哑粉纸', base_price: 0.18, sort: 3, status: 1 },
        { id: 4, spec_type_id: 1, name: '艺术纸', base_price: 0.25, sort: 4, status: 1 }
      ],
      2: [ // 打印颜色
        { id: 5, spec_type_id: 2, name: '黑白', base_price: 0.05, sort: 1, status: 1 },
        { id: 6, spec_type_id: 2, name: '彩色', base_price: 0.20, sort: 2, status: 1 },
        { id: 7, spec_type_id: 2, name: '专色', base_price: 0.35, sort: 3, status: 1 }
      ],
      3: [ // 纸张尺寸
        { id: 8, spec_type_id: 3, name: 'A4', base_price: 0.00, sort: 1, status: 1 },
        { id: 9, spec_type_id: 3, name: 'A3', base_price: 0.10, sort: 2, status: 1 },
        { id: 10, spec_type_id: 3, name: 'A5', base_price: -0.05, sort: 3, status: 1 },
        { id: 11, spec_type_id: 3, name: '自定义', base_price: 0.15, sort: 4, status: 1 }
      ],
      4: [ // 装订方式
        { id: 12, spec_type_id: 4, name: '无装订', base_price: 0.00, sort: 1, status: 1 },
        { id: 13, spec_type_id: 4, name: '骑马钉', base_price: 0.08, sort: 2, status: 1 },
        { id: 14, spec_type_id: 4, name: '胶装', base_price: 0.15, sort: 3, status: 1 },
        { id: 15, spec_type_id: 4, name: '精装', base_price: 0.30, sort: 4, status: 1 }
      ]
    }
    
    return Promise.resolve({
      code: 200,
      message: 'success',
      data: {
        list: allValues[spec_type_id] || [],
        total: allValues[spec_type_id]?.length || 0
      }
    })
  }
}