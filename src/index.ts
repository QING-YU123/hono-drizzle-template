import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors';
import 'dotenv/config';
import userController from './controllers/user.controller';

const app = new Hono()

app.use('*', cors({
  origin: '*', // 允许所有来源 (生产环境应该指定具体域名)
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的 HTTP 方法
  allowHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
  credentials: true, // 允许携带凭证 (cookies)
}));

// 2. 路由组装 (挂载 Controller)
app.route('/api/users', userController);

app.get('/', (c) => {
  return c.text('Hello! The Hono + Drizzle API is running.');
});

// 导出 app 供测试使用
export { app };

// 只在直接运行时启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  serve({
    fetch: app.fetch,
    port: 3001
  },
    (info) => {
      console.log(`🚀 Server is running on http://localhost:${info.port}`);
    })
}
