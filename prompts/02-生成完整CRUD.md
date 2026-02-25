# 生成完整 CRUD - 思考指南

## 🎯 这个指南帮助你

在创建 CRUD API 之前，你需要理解 CRUD 包含哪些操作，以及如何设计符合你需求的接口。

## 🤔 设计之前先问自己

### 1. CRUD 需要哪些操作？

**标准 CRUD 操作：**

| 操作 | HTTP 方法 | 路径 | 说明 |
|------|-----------|------|------|
| Create | POST | `/api/[resource]` | 创建新资源 |
| Read (list) | GET | `/api/[resource]` | 获取资源列表 |
| Read (one) | GET | `/api/[resource]/:id` | 获取单个资源 |
| Update | PUT | `/api/[resource]/:id` | 更新资源 |
| Delete | DELETE | `/api/[resource]/:id` | 删除资源 |

**额外操作（你可能需要）：**

| 操作 | 说明 | 例子 |
|------|------|------|
| Search | 搜索资源 | 搜索用户名包含"张"的用户 |
| Filter | 筛选资源 | 获取状态为"active"的用户 |
| Sort | 排序 | 按价格从低到高排序 |
| Paginate | 分页 | 每页20条，获取第2页 |
| Batch | 批量操作 | 批量删除多个商品 |
| Count | 统计 | 获取总记录数 |

### 2. 函数应该叫什么名字？

**这是你的决策！考虑这些因素：**

| 命名风格 | 例子 | 适合场景 |
|---------|------|---------|
| 动词+名词 | `getAllUsers()`, `createUser()` | 清晰直观 |
| 数据库风格 | `user.findAll()`, `user.create()` | 面向数据库 |
| RESTful 风格 | `getUsers()`, `postUser()` | 面向HTTP |
| 你自己的风格 | 由你决定！ | 符合你的理解 |

**示例对比：**

```
风格1: getAllUsers(), getUserById(), createUser(), updateUser(), deleteUser()
风格2: findAll(), findById(), create(), update(), delete()
风格3: list(), show(), store(), update(), destroy()
```

**选择一种并保持一致！**

### 3. 返回什么数据格式？

**List 操作：**

```typescript
// 选项1: 直接返回数组
[{ id: 1, name: "张三" }, { id: 2, name: "李四" }]

// 选项2: 包装对象
{
  success: true,
  data: [{ id: 1, name: "张三" }, { id: 2, name: "李四" }],
  total: 2
}

// 选项3: 分页格式
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 100,
    totalPages: 5
  }
}
```

**Single 操作：**

```typescript
// 选项1: 直接返回对象
{ id: 1, name: "张三", email: "zhang@example.com" }

// 选项2: 包装对象
{
  success: true,
  data: { id: 1, name: "张三", email: "zhang@example.com" }
}

// 选项3: 包含元数据
{
  success: true,
  data: {...},
  meta: {
    createdAt: "2024-01-01",
    updatedAt: "2024-01-02"
  }
}
```

### 4. 错误怎么处理？

**HTTP 状态码选择：**

| 场景 | 状态码 | 说明 |
|------|--------|------|
| 成功 | 200 | GET/PUT/DELETE 成功 |
| 创建成功 | 201 | POST 成功 |
| 参数错误 | 400 | 缺少必填字段、类型错误 |
| 未找到 | 404 | 资源不存在 |
| 冲突 | 409 | 唯一约束冲突（如重复邮箱） |
| 服务器错误 | 500 | 代码错误 |

**错误响应格式：**

```typescript
// 选项1: 简单格式
{
  success: false,
  error: "用户名不能为空"
}

// 选项2: 详细格式
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "用户名不能为空",
    field: "username"
  }
}

// 选项3: 多错误
{
  success: false,
  errors: {
    username: "用户名不能为空",
    email: "邮箱格式不正确"
  }
}
```

### 5. 是否需要软删除？

**软删除 vs 硬删除：**

| 对比 | 软删除 | 硬删除 |
|------|--------|--------|
| 数据保留 | ✅ 保留数据 | ❌ 永久删除 |
| 可恢复 | ✅ 可以恢复 | ❌ 无法恢复 |
| 查询影响 | 需要过滤 `deleted_at` | 不需要 |
| 存储空间 | 占用空间 | 释放空间 |
| 适用场景 | 用户、订单、重要数据 | 临时数据、日志 |

**本项目使用软删除**，所以所有查询都要过滤：
```typescript
.where(isNull(table.deleted_at))
```

### 6. 验证规则是什么？

**你需要为每个操作设计验证：**

| 操作 | 需要验证什么 |
|------|-------------|
| Create | 所有必填字段、字段类型、字段长度 |
| Update | 提供的字段类型、部分更新逻辑 |
| Delete | ID 有效性、资源是否存在 |

## 📊 设计你的 CRUD（在纸上或脑子里）

### 示例：设计商品 CRUD

**我的决策：**

| 决策点 | 我的选择 | 为什么 |
|--------|---------|--------|
| 命名风格 | `getAllProducts()`, `getProductById()` | 清晰，符合我的理解 |
| 返回格式 | 包装 `{success, data}` | 前端需要统一格式 |
| 错误格式 | `{success, error}` | 简单够用 |
| 软删除 | ✅ 使用 | 商品有关联数据 |
| 额外功能 | 后面添加搜索、分页 | 先实现基础 |

**我的 Service 方法设计：**

```typescript
// 我决定的方法名和签名
async getAllProducts(): Promise<Product[]>
async getProductById(id: number): Promise<Product | null>
async createProduct(data: CreateProductDto): Promise<Product>
async updateProduct(id: number, data: UpdateProductDto): Promise<Product | null>
async deleteProduct(id: number): Promise<Product | null>
```

**我的 Controller 路由设计：**

```
GET    /api/products       → 获取所有商品
GET    /api/products/:id   → 获取单个商品
POST   /api/products       → 创建商品
PUT    /api/products/:id   → 更新商品
DELETE /api/products/:id   → 删除商品
```

## 💬 向 AI 清楚表达你的设计

**好的提问方式：**

```
我想为商品表创建完整的 CRUD API，具体设计如下：

Service 层方法（src/services/product.ts）：
- getAllProducts(): 获取所有商品
- getProductById(id): 根据ID获取单个商品
- createProduct(data): 创建新商品
- updateProduct(id, data): 更新商品
- deleteProduct(id): 软删除商品

Controller 层路由（src/controllers/product.ts）：
- GET /api/products - 获取所有商品
- GET /api/products/:id - 获取单个商品
- POST /api/products - 创建商品
- PUT /api/products/:id - 更新商品
- DELETE /api/products/:id - 删除商品

返回格式：
{
  success: true,
  data: {...}
}

要求：
1. 使用软删除（过滤 deleted_at）
2. 所有查询都过滤已删除记录
3. ID 参数验证（必须是正整数）
4. 返回适当的 HTTP 状态码
5. 在 src/index.ts 中注册路由

请用 Hono + Drizzle 实现。
```

**为什么这样问更好：**
- ✅ 你决定了所有方法名
- ✅ 你决定了路由结构
- ✅ 你决定了返回格式
- ✅ AI 只负责实现你的设计

## 📚 技术参考

### 项目约定（你必须遵守的）

**软删除模式：**
```typescript
// 所有查询都要加这个
.where(isNull(table.deleted_at))
```

**时间字段更新：**
```typescript
// insert 和 update 都要设置 updated_at
.updated_at: new Date()
```

**返回值处理：**
```typescript
// Drizzle 的 .returning() 返回数组
const result = await db.insert(...).returning();
return result[0]; // 取第一个元素
```

### Hono Controller 模式

```typescript
import { Hono } from 'hono';

const controller = new Hono();

// GET /api/products
controller.get('/', async (c) => {
  const data = await service.getAllProducts();
  return c.json({ success: true, data });
});

// GET /api/products/:id
controller.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));

  // 验证 ID
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ success: false, error: 'Invalid id' }, 400);
  }

  const data = await service.getProductById(id);
  if (!data) {
    return c.json({ success: false, error: 'Not found' }, 404);
  }

  return c.json({ success: true, data });
});

// POST /api/products
controller.post('/', async (c) => {
  try {
    const body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Invalid JSON' }, 400);
  }

  // 验证字段...
  // 调用 service...
  return c.json({ success: true, data }, 201);
});
```

## ⚠️ 常见错误

### 错误1：复制别人的命名
```
❌ 不理解就用 getAll[Resource] 这样的模板
✅ 用你自己理解的命名，比如 findAllProducts
```

### 错误2：不考虑前端需求
```
❌ 随便返回一个数组
✅ 和前端确认返回格式（是否包装、分页等）
```

### 错误3：忘记软删除
```
❌ 直接查询，没有过滤 deleted_at
✅ 所有查询都加 .where(isNull(table.deleted_at))
```

### 错误4：不做验证
```
❌ 直接使用 req.param('id') 不检查
✅ 验证 ID 是正整数
```

## ✅ 检查清单

实现 CRUD 之前，确保你思考过：

- [ ] 我决定了我喜欢的方法命名
- [ ] 我设计了所有的路由
- [ ] 我决定了返回数据格式
- [ ] 我决定了错误处理方式
- [ ] 我理解了软删除是怎么工作的
- [ ] 我考虑了是否需要分页、搜索
- [ ] 我和前端确认了接口格式
- [ ] 我理解了每一行代码的作用

## 🎯 下一步

**实现完成后**：
1. 用 Postman 或 curl 测试每个接口
2. 检查返回格式是否符合你的设计
3. 验证软删除是否正常工作
4. 考虑添加搜索、分页等额外功能

**相关的思考指南：**
- `03-添加输入验证.md` - 如何验证请求参数
- `05-添加搜索功能.md` - 如何添加搜索和筛选
- `06-添加分页功能.md` - 如何添加分页
