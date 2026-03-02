/**
 * 测试辅助工具函数
 */

/**
 * 创建测试用用户数据
 */
export function createTestUser(overrides?: Partial<{ name: string; email: string }>) {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(7);

  return {
    name: `测试用户${randomSuffix}`,
    email: `test${timestamp}${randomSuffix}@example.com`,
    ...overrides
  };
}

/**
 * 解析响应体为 JSON
 */
export async function parseJsonResponse<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  throw new Error('Response is not JSON');
}

/**
 * 创建认证请求头
 */
export function createAuthHeaders(token: string = 'test-token') {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * 验证错误响应
 */
export function expectErrorResponse(body: any, expectedStatus: number) {
  expect(body).toHaveProperty('error');
  expect(typeof body.error).toBe('string');
  expect(body.error.length).toBeGreaterThan(0);
}

/**
 * 验证用户响应
 */
export function expectUserResponse(body: any) {
  expect(body).toHaveProperty('id');
  expect(body).toHaveProperty('name');
  expect(body).toHaveProperty('email');
  expect(body).toHaveProperty('created_at');
  expect(typeof body.id).toBe('number');
  expect(typeof body.name).toBe('string');
  expect(typeof body.email).toBe('string');
}

/**
 * 验证分页响应
 */
export function expectPaginatedResponse(body: any) {
  expect(body).toHaveProperty('data');
  expect(body).toHaveProperty('total');
  expect(body).toHaveProperty('page');
  expect(body).toHaveProperty('pageSize');
  expect(Array.isArray(body.data)).toBe(true);
  expect(typeof body.total).toBe('number');
  expect(typeof body.page).toBe('number');
  expect(typeof body.pageSize).toBe('number');
}

/**
 * 延迟函数（用于测试异步操作）
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成随机邮箱
 */
export function randomEmail(): string {
  return `test_${randomString(8)}@example.com`;
}

/**
 * 清理测试数据（如果实现了清理接口）
 */
export async function cleanupTestData(userId: number, app: any) {
  try {
    await app.request(`/api/users/${userId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    // 忽略清理错误
    console.warn('Failed to cleanup test data:', error);
  }
}
