/**
 * 中通物流配置
 */
const env = import.meta.env
// 中通物流API配置
export const ZTO_CONFIG = {
  // API基础URL
  baseUrl: 'https://japi.zto.com',
  
  // 商户ID（需要向中通申请）
  partnerId: env.VUE_APP_ZTO_PARTNER_ID || 'your_partner_id',
  
  // 密钥（需要向中通申请）
  partnerKey: env.VUE_APP_ZTO_PARTNER_KEY || 'your_partner_key',
  
  // 月结账号（需要向中通申请）
  monthlyAccount: env.VUE_APP_ZTO_MONTHLY_ACCOUNT || 'your_monthly_account',
  
  // 发件人信息（默认发件地址）
  sender: {
    name: '云打印服务中心',
    phone: '400-123-4567',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '科技园南区深圳湾科技生态园'
  }
}

// 物流状态映射
export const SHIPPING_STATUS = {
  PENDING: 0,     // 待发货
  SHIPPED: 1,     // 已发货
  IN_TRANSIT: 2,  // 运输中
  DELIVERED: 3,   // 已送达
  EXCEPTION: 4,   // 异常
  RETURNED: 5     // 退回
}

// 物流状态文本
export const SHIPPING_STATUS_TEXT = {
  [SHIPPING_STATUS.PENDING]: '待发货',
  [SHIPPING_STATUS.SHIPPED]: '已发货',
  [SHIPPING_STATUS.IN_TRANSIT]: '运输中',
  [SHIPPING_STATUS.DELIVERED]: '已送达',
  [SHIPPING_STATUS.EXCEPTION]: '异常',
  [SHIPPING_STATUS.RETURNED]: '退回'
}

// 中通物流服务类型
export const ZTO_SERVICE_TYPE = {
  STANDARD: '1',    // 标准快递
  EXPRESS: '2',     // 特快专递
  ECONOMY: '3'      // 经济快递
}

export default {
  ZTO_CONFIG,
  SHIPPING_STATUS,
  SHIPPING_STATUS_TEXT,
  ZTO_SERVICE_TYPE
}