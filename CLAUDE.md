# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Hono + Drizzle ORM 的 TypeScript API 模板项目，使用 PostgreSQL 数据库。


## 常用命令

### 开发
```bash
npm run dev      # 启动开发服务器 (tsx watch)
npm run build    # TypeScript 编译
npm run start    # 运行编译后的生产版本
```

### 数据库
```bash
npx drizzle-kit push     # 将 schema 推送到数据库 (schema 位于 ./src/db/schema)
```

## 架构说明

### 项目结构
- `src/index.ts` - 应用入口，初始化 Hono app 和数据库连接
- `src/db/schema/` - Drizzle ORM 数据库模型定义
  - `users.ts` - 表定义示例
  - `plugin/columns.helpers.ts` - 公共列字段 (created_at, updated_at, deleted_at)
- `src/controllers/` - Hono 路由控制器 (处理 HTTP 请求/响应)
- `src/services/` - 业务逻辑层 (数据库操作)

### 分层架构
项目采用经典的 MVC 分层模式：
1. **Controller 层** - 处理 HTTP 请求，参数验证，返回 JSON 响应
2. **Service 层** - 业务逻辑和数据库操作
3. **Schema 层** - 数据库表结构定义

### 数据库注意事项
- 使用 PostgreSQL 方言
- 实现软删除模式 (deleted_at 字段)
- 所有查询都应过滤已删除记录: `where(isNull(table.deleted_at))`
- 数据库实例从 `src/index.ts` 导出使用

### Drizzle Kit 配置
- 配置文件: `drizzle.config.ts`
- Schema 路径: `./src/db/schema`
- 迁移输出目录: `./drizzle`
- 需要 `.env` 文件中的 `DATABASE_URL` 环境变量

### TypeScript 配置
- 使用 ESNext target 和 NodeNext 模块
- 严格模式已启用
- JSX 支持用于 Hono 的 JSX 语法

## AI 开发约束

### 职责范围
AI 应该专注于代码开发，不应该负责以下任务：

❌ **不要创建**：
- 测试文件（单元测试、集成测试、E2E 测试）
- CI/CD 配置（GitHub Actions, GitLab CI, Jenkins 等）
- Docker 配置（Dockerfile, docker-compose.yml）
- Kubernetes 配置
- 部署脚本
- 监控和日志配置
- 环境变量模板（除了必要的 DATABASE_URL 说明）

✅ **应该专注于**：
- 业务逻辑代码实现
- 数据库 Schema 和迁移
- API 路由和控制器
- 服务层开发
- 类型定义和验证
- 代码重构和优化
- Bug 修复

### 原因
测试、部署和基础设施应该由开发团队根据实际需求手动配置，AI 的角色是加速业务代码的开发。
