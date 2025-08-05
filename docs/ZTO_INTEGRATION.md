# 中通物流电子面单集成说明

## 概述

本项目已集成中通物流电子面单功能，支持在订单管理页面直接创建快递单并发货。当订单状态和支付状态都为1时，会显示发货按钮。

## 功能特性

- ✅ 订单发货管理
- ✅ 中通物流电子面单创建
- ✅ 收货地址信息填写
- ✅ 物品重量和描述设置
- ✅ 手机号格式验证
- ✅ API签名生成
- ✅ 错误处理和用户提示

## 配置步骤

### 1. 申请中通物流账号

1. 访问中通物流官网：https://www.zto.com/
2. 申请电子面单服务
3. 获取以下信息：
   - `partnerId`：商户ID
   - `partnerKey`：密钥
   - `monthlyAccount`：月结账号

### 2. 环境变量配置

在项目根目录的 `.env` 文件中添加：

```env
# 中通物流配置
VUE_APP_ZTO_PARTNER_ID=your_partner_id
VUE_APP_ZTO_PARTNER_KEY=your_partner_key
VUE_APP_ZTO_MONTHLY_ACCOUNT=your_monthly_account
```

### 3. 发件人信息配置

修改 `src/config/shipping.js` 文件中的发件人信息：

```javascript
sender: {
  name: '您的公司名称',
  phone: '您的联系电话',
  province: '您的省份',
  city: '您的城市',
  district: '您的区县',
  address: '您的详细地址'
}
```

### 4. 后端API接口

需要在后端实现以下接口：

#### 创建电子面单
```
POST /api/shipping/zto/create
```

请求参数：
```json
{
  "order_id": 123,
  "order_sn": "YP1234567890",
  "zto_data": {
    "partnerId": "商户ID",
    "orderNo": "订单号",
    "senderName": "发件人姓名",
    "senderPhone": "发件人电话",
    "senderProvince": "发件人省份",
    "senderCity": "发件人城市",
    "senderDistrict": "发件人区县",
    "senderAddress": "发件人地址",
    "receiverName": "收件人姓名",
    "receiverPhone": "收件人电话",
    "receiverProvince": "收件人省份",
    "receiverCity": "收件人城市",
    "receiverDistrict": "收件人区县",
    "receiverAddress": "收件人地址",
    "goodsName": "物品名称",
    "goodsWeight": 0.5,
    "remark": "备注",
    "timestamp": "时间戳",
    "sign": "签名"
  },
  "receiver": {
    "name": "收件人姓名",
    "phone": "收件人电话",
    "address": "收件人地址",
    "province": "省份",
    "city": "城市",
    "district": "区县"
  },
  "goods": {
    "weight": 0.5,
    "description": "打印文件"
  },
  "remark": "发货备注"
}
```

响应格式：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "waybill_no": "快递单号",
    "order_no": "订单号",
    "status": "状态"
  }
}
```

#### 查询快递状态
```
GET /api/shipping/zto/query?waybill_no=快递单号
```

#### 获取订单物流信息
```
GET /api/shipping/order/{order_id}
```

#### 取消快递单
```
POST /api/shipping/zto/cancel
```

## 使用说明

### 发货流程

1. 在订单列表页面，找到状态为"已确认"且支付状态为"已支付"的订单
2. 点击"发货"按钮
3. 填写收货人信息：
   - 收货人姓名（必填）
   - 收货人电话（必填，会验证格式）
   - 收货地址（必填）
   - 省市区信息
   - 物品重量（默认0.5kg）
   - 物品描述（默认"打印文件"）
   - 发货备注（可选）
4. 点击"确定"创建电子面单
5. 系统会调用中通API创建快递单
6. 成功后显示提示信息，快递单号会通过短信发送给用户

### 注意事项

1. **手机号验证**：收货人手机号必须是有效的中国大陆手机号
2. **地址信息**：建议填写完整的省市区信息，便于快递配送
3. **物品重量**：根据实际打印文件重量填写，影响运费计算
4. **API限制**：中通API有调用频率限制，请合理使用
5. **错误处理**：如果创建失败，请检查网络连接和配置信息

## 文件结构

```
src/
├── views/order/
│   ├── order/
│   │   └── index.vue          # 订单列表页面（包含发货功能）
│   └── api/
│       └── shipping.js        # 物流API接口
├── config/
│   └── shipping.js            # 物流配置文件
├── utils/
│   └── ztoUtils.js           # 中通物流工具类
└── docs/
    └── ZTO_INTEGRATION.md     # 本文档
```

## 开发调试

### 测试环境

在开发环境中，可以使用中通提供的测试环境进行调试：

```javascript
// 在 shipping.js 中修改baseUrl
baseUrl: 'https://japi-test.zto.com'  // 测试环境
```

### 日志记录

系统会在控制台输出详细的调试信息，包括：
- API请求参数
- 签名生成过程
- 响应数据
- 错误信息

### 常见问题

1. **签名验证失败**：检查partnerId和partnerKey是否正确
2. **地址格式错误**：确保省市区信息符合中通要求
3. **网络超时**：检查网络连接和API地址
4. **权限不足**：确认账号已开通电子面单服务

## 后续扩展

- [ ] 支持其他快递公司（顺丰、圆通等）
- [ ] 批量发货功能
- [ ] 物流轨迹查询
- [ ] 快递单打印功能
- [ ] 发货统计报表

## 技术支持

如有问题，请联系：
- 中通物流技术支持：400-xxx-xxxx
- 项目开发团队：your-email@example.com