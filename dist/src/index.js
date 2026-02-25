import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import userController from './controllers/user.controller';
export const db = drizzle(process.env.DATABASE_URL);
const app = new Hono();
app.use('*', cors());
// 2. 路由组装 (挂载 Controller)
app.route('/api/users', userController);
app.get('/', (c) => {
    return c.text('Hello! The Hono + Drizzle API is running.');
});
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
});
