---
name: route-generator
description: Generate REST API endpoints with proper validation for Hono + Drizzle projects. Creates controllers following Hono patterns with full CRUD operations, input validation, and error handling.
---

# Route Generator

This skill creates REST API endpoints (controllers) for Hono applications with proper validation, error handling, and HTTP status codes.

## When to Use This Skill

Use this skill when the user asks to:
- "Create API endpoints" or "Add routes"
- "Create a controller for X"
- "Add GET/POST/PUT/DELETE endpoints"
- "Create REST API for [resource]"

## What This Skill Generates

A complete Hono controller with:
- GET `/api/[resource]` - List all resources
- GET `/api/[resource]/:id` - Get single resource by ID
- POST `/api/[resource]` - Create new resource
- PUT `/api/[resource]/:id` - Update resource
- DELETE `/api/[resource]/:id` - Soft delete resource

## How to Use

### Step 1: Ask for Resource Details

Ask the user for:
- **Resource name** (singular, e.g., "product", "order")
- **Fields** that need validation
- **Service name** if different from resource name

Example prompt:
```
I'll create API endpoints for you. Please provide:
1. Resource name (singular): e.g., "product"
2. Fields to validate: e.g., "name (string, required), price (number, required), description (string, optional)"
3. Service name (optional, defaults to "[Resource]Service")
```

### Step 2: Create Controller File

Create `src/controllers/[resource].controller.ts`:

```typescript
import { Hono } from 'hono';
import { [Resource]Service } from '../services/[resource].service';

const [resource]Controller = new Hono();

// GET /api/[resource]s - List all
[resource]Controller.get('/', async (c) => {
  const data = await [Resource]Service.getAll[Resource]();
  return c.json(data);
});

// GET /api/[resource]s/:id - Get by ID
[resource]Controller.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ message: 'Invalid id' }, 400);
  }

  const data = await [Resource]Service.get[Resource]ById(id);
  if (!data) {
    return c.json({ message: '[Resource] not found' }, 404);
  }
  return c.json(data);
});

// POST /api/[resource]s - Create new
[resource]Controller.post('/', async (c) => {
  // Parse JSON body
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  // Extract and validate fields
  const { field1, field2, field3 } = (body ?? {}) as {
    field1?: unknown;
    field2?: unknown;
    field3?: unknown;
  };

  // Validate required fields
  if (typeof field1 !== 'string' || field1.trim().length === 0) {
    return c.json({ message: 'field1 is required' }, 400);
  }

  if (typeof field2 !== 'number' || isNaN(field2)) {
    return c.json({ message: 'field2 must be a number' }, 400);
  }

  // Optional field validation
  let validatedField3: string | undefined;
  if (field3 !== undefined) {
    if (typeof field3 !== 'string') {
      return c.json({ message: 'field3 must be a string' }, 400);
    }
    validatedField3 = field3.trim();
  }

  try {
    const data = await [Resource]Service.create[Resource]({
      field1: field1.trim(),
      field2,
      field3: validatedField3,
    });
    return c.json(data, 201);
  } catch (err) {
    // Handle unique constraint violation
    if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
      return c.json({ message: '[Resource] already exists' }, 409);
    }
    throw err;
  }
});

// PUT /api/[resource]s/:id - Update
[resource]Controller.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ message: 'Invalid id' }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  const { field1, field2, field3 } = (body ?? {}) as {
    field1?: unknown;
    field2?: unknown;
    field3?: unknown;
  };

  const payload: Partial<{
    field1: string;
    field2: number;
    field3: string;
  }> = {};

  // Validate each field if provided
  if (field1 !== undefined) {
    if (typeof field1 !== 'string' || field1.trim().length === 0) {
      return c.json({ message: 'field1 must be a non-empty string' }, 400);
    }
    payload.field1 = field1.trim();
  }

  if (field2 !== undefined) {
    if (typeof field2 !== 'number' || isNaN(field2)) {
      return c.json({ message: 'field2 must be a number' }, 400);
    }
    payload.field2 = field2;
  }

  if (field3 !== undefined) {
    if (typeof field3 !== 'string' || field3.trim().length === 0) {
      return c.json({ message: 'field3 must be a non-empty string' }, 400);
    }
    payload.field3 = field3.trim();
  }

  if (Object.keys(payload).length === 0) {
    return c.json({ message: 'Nothing to update' }, 400);
  }

  try {
    const data = await [Resource]Service.update[Resource](id, payload);
    if (!data) {
      return c.json({ message: '[Resource] not found' }, 404);
    }
    return c.json(data);
  } catch (err) {
    if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
      return c.json({ message: '[Resource] already exists' }, 409);
    }
    throw err;
  }
});

// DELETE /api/[resource]s/:id - Soft delete
[resource]Controller.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ message: 'Invalid id' }, 400);
  }

  const data = await [Resource]Service.delete[Resource](id);
  if (!data) {
    return c.json({ message: '[Resource] not found' }, 404);
  }

  return c.json({ message: 'Deleted', data });
});

export default [resource]Controller;
```

### Step 3: Register Route in Index

Update `src/index.ts`:

```typescript
import [resource]Controller from './controllers/[resource].controller';

// Add the route
app.route('/api/[resource]s', [resource]Controller);
```

## Validation Patterns

### String Validation
```typescript
// Required string
if (typeof field !== 'string' || field.trim().length === 0) {
  return c.json({ message: 'field is required' }, 400);
}

// Optional string
if (field !== undefined) {
  if (typeof field !== 'string') {
    return c.json({ message: 'field must be a string' }, 400);
  }
  // Use field.trim()
}

// String with length validation
if (typeof field !== 'string' || field.length > 255) {
  return c.json({ message: 'field must be 255 characters or less' }, 400);
}

// Email format (basic)
if (typeof field !== 'string' || !field.includes('@')) {
  return c.json({ message: 'field must be a valid email' }, 400);
}
```

### Number Validation
```typescript
// Required number
if (typeof field !== 'number' || isNaN(field)) {
  return c.json({ message: 'field must be a number' }, 400);
}

// Positive number
if (typeof field !== 'number' || isNaN(field) || field <= 0) {
  return c.json({ message: 'field must be a positive number' }, 400);
}

// Integer
if (!Number.isInteger(field)) {
  return c.json({ message: 'field must be an integer' }, 400);
}

// Range validation
if (field < 0 || field > 100) {
  return c.json({ message: 'field must be between 0 and 100' }, 400);
}
```

### Boolean Validation
```typescript
if (typeof field !== 'boolean') {
  return c.json({ message: 'field must be true or false' }, 400);
}
```

## HTTP Status Codes

| Code | Usage | Example |
|------|-------|---------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input, validation failed |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Unique constraint violated |

## Error Handling

### JSON Parse Error
```typescript
let body: unknown;
try {
  body = await c.req.json();
} catch {
  return c.json({ message: 'Invalid JSON body' }, 400);
}
```

### Unique Constraint Violation
```typescript
try {
  const data = await Service.create(data);
  return c.json(data, 201);
} catch (err) {
  if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
    return c.json({ message: 'Already exists' }, 409);
  }
  throw err;
}
```

### Not Found
```typescript
const data = await Service.getById(id);
if (!data) {
  return c.json({ message: '[Resource] not found' }, 404);
}
```

## Controller Template

Use this template for quick generation:

```typescript
import { Hono } from 'hono';
import { [Resource]Service } from '../services/[resource].service';

const [resource]Controller = new Hono();

[resource]Controller.get('/', async (c) => {
  const data = await [Resource]Service.getAll[Resource]();
  return c.json(data);
});

[resource]Controller.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ message: 'Invalid id' }, 400);
  }
  const data = await [Resource]Service.get[Resource]ById(id);
  if (!data) {
    return c.json({ message: '[Resource] not found' }, 404);
  }
  return c.json(data);
});

[resource]Controller.post('/', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  // Add validation here

  try {
    const data = await [Resource]Service.create[Resource](body);
    return c.json(data, 201);
  } catch (err) {
    if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
      return c.json({ message: 'Already exists' }, 409);
    }
    throw err;
  }
});

[resource]Controller.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ message: 'Invalid id' }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  // Add validation here

  try {
    const data = await [Resource]Service.update[Resource](id, body);
    if (!data) {
      return c.json({ message: '[Resource] not found' }, 404);
    }
    return c.json(data);
  } catch (err) {
    if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
      return c.json({ message: 'Already exists' }, 409);
    }
    throw err;
  }
});

[resource]Controller.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id) || id <= 0) {
    return c.json({ message: 'Invalid id' }, 400);
  }

  const data = await [Resource]Service.delete[Resource](id);
  if (!data) {
    return c.json({ message: '[Resource] not found' }, 404);
  }

  return c.json({ message: 'Deleted', data });
});

export default [resource]Controller;
```

## Verification Checklist

After creating a controller, verify:
- [ ] All 5 endpoints implemented (GET list, GET by id, POST, PUT, DELETE)
- [ ] ID validation on all `:id` routes
- [ ] JSON parse error handling
- [ ] Required field validation
- [ ] Optional field validation (partial updates)
- [ ] Unique constraint handling (409 status)
- [ ] Proper HTTP status codes
- [ ] Route registered in `src/index.ts`
- [ ] Service import is correct
