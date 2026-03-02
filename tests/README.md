# 测试系统使用指南

本指南说明项目中的完整测试系统，包括测试代码、测试用例管理和测试报告生成。

## 📁 测试目录结构

```
tests/                            # 测试代码目录
├── api/                          # API 集成测试
│   ├── app.test.ts              # 应用基础测试
│   └── users.test.ts            # 用户 API 测试
├── utils/                        # 测试工具函数
│   └── test-helpers.ts          # 辅助函数
├── vitest.config.ts              # Vitest 配置文件
└── README.md                     # 本文件

business/iterations/              # 业务迭代目录
└── v0.1.0-MVP/                  # 版本目录
    └── 测试/
        ├── 测试用例.md           # 该版本的测试用例
        ├── 测试报告/            # 该版本的测试报告
        │   └── 测试报告-20260302.md
        └── 测试说明.md          # 该版本的特定说明
```

## 🚀 快速开始

### 1. 运行所有测试
```bash
pnpm test
```

### 2. 运行特定测试文件
```bash
pnpm test users.test.ts
```

### 3. 打开测试 UI 界面
```bash
pnpm test:ui
```

### 4. 生成测试覆盖率报告
```bash
pnpm test:coverage
```

## 🔄 完整测试工作流程

### 步骤 1：编写测试用例

在对应版本的测试用例文档中编写测试用例：

**文件位置**: `business/iterations/{version}/测试/测试用例.md`

```markdown
### 测试用例设计

#### 1. GET /api/users（获取所有用户列表）

| 测试ID | 测试点 | 前置条件 | 测试步骤 | 预期结果 |
|--------|--------|----------|----------|----------|
| UC-GET-001 | 成功获取用户列表 | 数据库中已有用户 | 1. 发送 GET 请求到 `/api/users` | 1. 响应状态码为 200<br>2. 响应体为 JSON 数组 |
| UC-GET-002 | 空用户列表 | 数据库中无用户 | 1. 发送 GET 请求到 `/api/users` | 1. 响应状态码为 200<br>2. 响应体为空数组 |
```

### 步骤 2：生成测试代码

使用 `test-generator` 技能自动生成测试代码：

```
用户：为 v0.1.0-MVP 版本生成测试

AI：发现以下版本：
- v0.1.0-MVP

当前测试版本：v0.1.0-MVP
测试用例路径：business/iterations/v0.1.0-MVP/测试/测试用例.md

正在生成测试代码...
✅ 测试文件已创建：tests/api/users.test.ts
```

### 步骤 3：运行测试

```bash
# 运行所有测试
pnpm test

# 或运行特定测试
pnpm test tests/api/users.test.ts
```

### 步骤 4：查看测试报告

测试报告会自动保存到对应版本的测试报告目录：

**文件位置**: `business/iterations/{version}/测试/测试报告/测试报告-YYYYMMDD-HHmmss.md`

## 📋 测试用例编写规范

### 推荐格式：详细表格格式

使用详细表格格式可以获得更好的测试覆盖率：

```markdown
#### POST /api/users（创建新用户）

| 测试ID | 测试点 | 前置条件 | 测试步骤 | 预期结果 |
|--------|--------|----------|----------|----------|
| UC-POST-001 | 成功创建用户 | 无 | 1. 发送 POST 请求到 `/api/users`，请求体为 `{"name": "王五", "email": "wangwu@example.com"}` | 1. 响应状态码为 201<br>2. 返回完整用户对象 |
| UC-POST-002 | 缺少必填字段 | 无 | 1. 发送 POST 请求，请求体缺少 name | 1. 响应状态码为 400<br>2. 错误信息 "name is required" |
```

### 测试用例要素

每个测试用例应包含：

1. **测试ID**: 唯一标识符（如 UC-POST-001）
2. **测试点**: 简洁描述测试目的
3. **前置条件**: 测试前需要准备的状态
4. **测试步骤**: 具体的操作步骤
5. **预期结果**: 期望的响应和状态

### 测试用例分类

#### 正常场景测试
- 成功创建用户
- 成功获取用户列表
- 成功更新用户信息

#### 异常场景测试
- 缺少必填字段
- 字段格式错误
- 数据重复冲突

#### 边界条件测试
- 最小/最大长度
- 极限值测试
- 空值处理

#### 集成场景测试
- 完整业务流程
- 多步骤操作
- 数据一致性

## 💻 测试代码编写规范

### 1. 测试文件结构

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../src/index';

describe('[模块名称]', () => {
  // 设置和清理
  beforeAll(async () => {
    // 测试前的准备工作
  });

  afterAll(async () => {
    // 测试后的清理工作
  });

  // 按接口分组
  describe('[接口名称]', () => {
    // 每个场景一个测试用例
    it('[测试ID]: [测试点描述]', async () => {
      // 测试代码
    });
  });
});
```

### 2. 测试命名规范

```typescript
// 详细格式：使用测试ID和测试点描述
it('UC-POST-001: 成功创建用户（正常数据）', async () => {
  // 测试代码
});

// 简化格式：使用行为描述
it('should create user with valid data', async () => {
  // 测试代码
});
```

### 3. 测试辅助工具

```typescript
import { createTestUser, randomEmail, expectUserResponse } from '../utils/test-helpers';

// 创建测试用户
const user = createTestUser({ name: '自定义用户名' });

// 随机生成邮箱
const email = randomEmail();

// 验证用户响应
expectUserResponse(body);
```

## 📊 测试报告说明

### 测试报告内容

测试报告包含以下信息：

1. **测试概要**: 版本、时间、环境信息
2. **测试统计**: 总数、通过、失败、通过率
3. **测试结果详情**: 每个测试的执行情况
4. **失败用例分析**: 详细的问题诊断和修复建议
5. **覆盖率报告**: 代码覆盖情况
6. **测试结论**: 总体评价和下一步建议

### 测试报告示例

```markdown
# v0.1.0-MVP API 测试报告

## 测试概要

**测试时间**: 2026-03-02 11:30:00
**测试版本**: v0.1.0-MVP
**测试环境**: 开发环境

### 测试统计

- **总用例数**: 48
- **通过**: 45 ✅
- **失败**: 3 ❌
- **通过率**: 93.75%
```

## 🎯 测试最佳实践

### 测试用例编写

1. **完整性**: 覆盖正常、异常、边界场景
2. **独立性**: 每个测试用例相互独立
3. **可重复性**: 测试结果应该可重复
4. **清晰性**: 测试目的和步骤明确

### 测试代码维护

1. **及时更新**: 业务变化时同步更新测试
2. **代码质量**: 保持测试代码清晰易读
3. **性能考虑**: 避免不必要的等待和延迟
4. **数据清理**: 测试后清理测试数据

### 测试报告管理

1. **定期审查**: 定期查看测试报告
2. **历史追踪**: 保留历史测试报告
3. **问题追踪**: 及时处理失败测试
4. **持续改进**: 不断优化测试用例

## 🚨 常见问题

### Q1: 如何创建新版本的测试？

1. 在 `business/iterations/` 下创建新版本目录
2. 在新版本目录下创建 `测试/` 目录
3. 复制并修改测试用例模板
4. 使用 `test-generator` 技能生成测试代码

### Q2: 测试失败了怎么办？

1. 查看测试报告中的失败用例分析
2. 根据修复建议调整代码
3. 重新运行测试验证修复
4. 生成新的测试报告

### Q3: 如何添加新的测试用例？

1. 在测试用例文档中添加新的测试行
2. 使用 `test-generator` 重新生成测试代码
3. 运行测试验证新用例

### Q4: 测试报告在哪里？

测试报告保存在 `business/iterations/{version}/测试/测试报告/` 目录下，文件名格式为 `测试报告-YYYYMMDD-HHmmss.md`。

### Q5: 如何选择测试版本？

当存在多个版本时，`test-generator` 技能会：
1. 自动扫描所有版本
2. 默认选择最新版本
3. 可以手动指定要测试的版本

## 📚 相关资源和 Skills

### Skills 系统资源

- [test-case-designer skill](../.claude/skills/test-case-designer/skill.md) - 基于 OpenAPI 设计测试用例
- [test-generator skill](../.claude/skills/test-generator/skill.md) - 生成测试代码和运行测试
- [openapi-generator skill](../.claude/skills/openapi-generator/skill.md) - 生成 OpenAPI 文档

### 测试流程完整链路

```
OpenAPI 文档 (openapi-generator)
    ↓
测试用例设计 (test-case-designer)
    ↓
测试代码生成 (test-generator)
    ↓
测试运行和报告 (test-generator)
```

### 外部资源

- [Vitest 官方文档](https://vitest.dev/) - 测试框架文档
- [项目测试说明](../business/iterations/v0.1.0-MVP/测试/测试说明.md) - 版本特定测试说明
- [测试用例文档说明](../docs/test-cases.md) - 旧版测试用例格式（仅供参考）

## 🔧 版本管理

每个版本的测试用例和测试报告独立管理：

```
business/iterations/
├── v0.1.0-MVP/
│   └── 测试/
│       ├── 测试用例.md
│       ├── 测试报告/
│       └── 测试说明.md
├── v0.2.0-beta/
│   └── 测试/
│       ├── 测试用例.md
│       ├── 测试报告/
│       └── 测试说明.md
└── v1.0.0-release/
    └── 测试/
        ├── 测试用例.md
        ├── 测试报告/
        └── 测试说明.md
```

这样可以清晰地追踪每个版本的测试情况，便于版本对比和问题追踪。

---

**最后更新**: 2026-03-02
**维护者**: AI 测试生成器
**版本**: 1.0
