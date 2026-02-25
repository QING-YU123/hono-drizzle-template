---
name: validator-generator
description: Generate TypeScript validation schemas and functions for Hono + Drizzle projects. Creates type-safe request validation with proper error messages, supporting both inline validation patterns and Zod integration.
---

# TypeScript Validator Generator

This skill creates validation schemas and functions for API requests, ensuring type-safe input validation with proper error messages.

## When to Use This Skill

Use this skill when the user asks to:
- "Create validation" or "Add input validation"
- "Validate request body"
- "Create validation schema for [resource]"
- "Add type checking for API inputs"

## What This Skill Generates

Two types of validation are supported:
1. **Inline Validation Functions** - Pure TypeScript validation (current project pattern)
2. **Zod Schemas** - If Zod is added as a dependency

## How to Use

### Step 1: Ask for Validation Requirements

Ask the user for:
- **Resource name** (e.g., "product", "order")
- **Fields** to validate with types and constraints
- **Validation type** (inline functions or Zod)

Example prompt:
```
I'll create validation for you. Please provide:
1. Resource name: e.g., "product"
2. Fields with constraints: e.g., "name (string, required, min 3, max 255), price (number, required, positive), description (string, optional)"
3. Use Zod? (yes/no)
```

## Option 1: Inline Validation Functions

Create `src/validators/[resource].validator.ts`:

```typescript
/**
 * Validation result type
 */
export type ValidationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  errors: Record<string, string>;
};

/**
 * String field validation
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    trim?: boolean;
  } = {}
): { valid: boolean; error?: string; value?: string } {
  const { required = false, minLength, maxLength, trim = true } = options;

  // Check if value exists
  if (value === undefined || value === null) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true }; // Optional field, allow undefined
  }

  // Check type
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  // Trim if needed
  const stringValue = trim ? value.trim() : value;

  // Check empty string
  if (stringValue.length === 0) {
    if (required) {
      return { valid: false, error: `${fieldName} cannot be empty` };
    }
    return { valid: true };
  }

  // Check min length
  if (minLength && stringValue.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  // Check max length
  if (maxLength && stringValue.length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }

  return { valid: true, value: stringValue };
}

/**
 * Number field validation
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
  } = {}
): { valid: boolean; error?: string; value?: number } {
  const { required = false, min, max, integer = false, positive = false } = options;

  // Check if value exists
  if (value === undefined || value === null) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true }; // Optional field
  }

  // Check type
  if (typeof value !== 'number') {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  // Check if NaN
  if (isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  // Check integer
  if (integer && !Number.isInteger(value)) {
    return { valid: false, error: `${fieldName} must be an integer` };
  }

  // Check positive
  if (positive && value <= 0) {
    return { valid: false, error: `${fieldName} must be a positive number` };
  }

  // Check min
  if (min !== undefined && value < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  // Check max
  if (max !== undefined && value > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true, value };
}

/**
 * Email field validation
 */
export function validateEmail(
  value: unknown,
  fieldName: string,
  options: { required?: boolean } = {}
): { valid: boolean; error?: string; value?: string } {
  const { required = false } = options;

  if (value === undefined || value === null) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const email = value.trim();

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: `${fieldName} must be a valid email address` };
  }

  return { valid: true, value: email };
}

/**
 * Boolean field validation
 */
export function validateBoolean(
  value: unknown,
  fieldName: string,
  options: { required?: boolean } = {}
): { valid: boolean; error?: string; value?: boolean } {
  const { required = false } = options;

  if (value === undefined || value === null) {
    if (required) {
      return { valid: false, error: `${fieldName} is required` };
    }
    return { valid: true };
  }

  if (typeof value !== 'boolean') {
    return { valid: false, error: `${fieldName} must be true or false` };
  }

  return { valid: true, value };
}

/**
 * ID parameter validation
 */
export function validateId(id: unknown): { valid: boolean; error?: string; value?: number } {
  if (typeof id !== 'string' && typeof id !== 'number') {
    return { valid: false, error: 'Invalid id' };
  }

  const numId = typeof id === 'string' ? Number(id) : id;

  if (!Number.isInteger(numId) || numId <= 0) {
    return { valid: false, error: 'Invalid id' };
  }

  return { valid: true, value: numId };
}

// ========== [Resource] Validators ==========

export interface Create[Resource]Input {
  field1: string;
  field2: number;
  field3?: string;
}

export interface Update[Resource]Input {
  field1?: string;
  field2?: number;
  field3?: string;
}

/**
 * Validate create [resource] input
 */
export function validateCreate[Resource]Input(
  body: unknown
): ValidationResult<Create[Resource]Input> {
  if (typeof body !== 'object' || body === null) {
    return {
      success: false,
      errors: { _form: 'Invalid request body' },
    };
  }

  const data = body as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const validatedData: Partial<Create[Resource]Input> = {};

  // Validate field1
  const field1Result = validateString(data.field1, 'field1', {
    required: true,
    minLength: 3,
    maxLength: 255,
  });
  if (!field1Result.valid) {
    errors.field1 = field1Result.error!;
  } else if (field1Result.value !== undefined) {
    validatedData.field1 = field1Result.value;
  }

  // Validate field2
  const field2Result = validateNumber(data.field2, 'field2', {
    required: true,
    positive: true,
  });
  if (!field2Result.valid) {
    errors.field2 = field2Result.error!;
  } else if (field2Result.value !== undefined) {
    validatedData.field2 = field2Result.value;
  }

  // Validate field3 (optional)
  if (data.field3 !== undefined) {
    const field3Result = validateString(data.field3, 'field3', {
      required: false,
      maxLength: 1000,
    });
    if (!field3Result.valid) {
      errors.field3 = field3Result.error!;
    } else if (field3Result.value !== undefined) {
      validatedData.field3 = field3Result.value;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData as Create[Resource]Input };
}

/**
 * Validate update [resource] input
 */
export function validateUpdate[Resource]Input(
  body: unknown
): ValidationResult<Update[Resource]Input> {
  if (typeof body !== 'object' || body === null) {
    return {
      success: false,
      errors: { _form: 'Invalid request body' },
    };
  }

  const data = body as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const validatedData: Partial<Update[Resource]Input> = {};

  // Validate field1 (optional for update)
  if (data.field1 !== undefined) {
    const field1Result = validateString(data.field1, 'field1', {
      required: false,
      minLength: 3,
      maxLength: 255,
    });
    if (!field1Result.valid) {
      errors.field1 = field1Result.error!;
    } else if (field1Result.value !== undefined) {
      validatedData.field1 = field1Result.value;
    }
  }

  // Validate field2 (optional for update)
  if (data.field2 !== undefined) {
    const field2Result = validateNumber(data.field2, 'field2', {
      required: false,
      positive: true,
    });
    if (!field2Result.valid) {
      errors.field2 = field2Result.error!;
    } else if (field2Result.value !== undefined) {
      validatedData.field2 = field2Result.value;
    }
  }

  // Validate field3 (optional)
  if (data.field3 !== undefined) {
    const field3Result = validateString(data.field3, 'field3', {
      required: false,
      maxLength: 1000,
    });
    if (!field3Result.valid) {
      errors.field3 = field3Result.error!;
    } else if (field3Result.value !== undefined) {
      validatedData.field3 = field3Result.value;
    }
  }

  // Check if at least one field is being updated
  if (Object.keys(validatedData).length === 0) {
    return {
      success: false,
      errors: { _form: 'At least one field must be provided' },
    };
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: validatedData as Update[Resource]Input };
}
```

### Usage in Controller

```typescript
import { validateId, validateCreate[Resource]Input, validateUpdate[Resource]Input } from '../validators/[resource].validator';

// POST /
[resource]Controller.post('/', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  const validation = validateCreate[Resource]Input(body);
  if (!validation.success) {
    return c.json({ errors: validation.errors }, 400);
  }

  try {
    const data = await [Resource]Service.create[Resource](validation.data);
    return c.json(data, 201);
  } catch (err) {
    // Handle errors...
  }
});

// PUT /:id
[resource]Controller.put('/:id', async (c) => {
  // Validate ID
  const idValidation = validateId(c.req.param('id'));
  if (!idValidation.valid) {
    return c.json({ message: idValidation.error }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  const validation = validateUpdate[Resource]Input(body);
  if (!validation.success) {
    return c.json({ errors: validation.errors }, 400);
  }

  try {
    const data = await [Resource]Service.update[Resource](idValidation.value!, validation.data);
    return c.json(data);
  } catch (err) {
    // Handle errors...
  }
});
```

## Option 2: Zod Schemas (If Zod is Available)

First, install Zod if not already installed:
```bash
npm install zod
```

Create `src/validators/[resource].validator.ts`:

```typescript
import { z } from 'zod';

/**
 * [Resource] schemas
 */

export const create[Resource]Schema = z.object({
  field1: z.string()
    .min(3, 'field1 must be at least 3 characters')
    .max(255, 'field1 must be at most 255 characters')
    .trim(),
  field2: z.number()
    .positive('field2 must be positive')
    .int('field2 must be an integer'),
  field3: z.string()
    .max(1000, 'field3 must be at most 1000 characters')
    .trim()
    .optional(),
});

export const update[Resource]Schema = create[Resource]Schema.partial();

export const idParamSchema = z.string()
  .transform((val) => Number(val))
  .refine((val) => Number.isInteger(val) && val > 0, {
    message: 'Invalid id',
  });

// Infer types from schemas
export type Create[Resource]Input = z.infer<typeof create[Resource]Schema>;
export type Update[Resource]Input = z.infer<typeof update[Resource]Schema>;

/**
 * Validation helpers
 */
export function validateCreate[Resource]Input(body: unknown) {
  return create[Resource]Schema.safeParse(body);
}

export function validateUpdate[Resource]Input(body: unknown) {
  return update[Resource]Schema.safeParse(body);
}

export function validateIdParam(id: unknown) {
  return idParamSchema.safeParse(id);
}
```

### Usage in Controller with Zod

```typescript
import { validateCreate[Resource]Input, validateUpdate[Resource]Input, validateIdParam } from '../validators/[resource].validator';

// POST /
[resource]Controller.post('/', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: 'Invalid JSON body' }, 400);
  }

  const validation = validateCreate[Resource]Input(body);
  if (!validation.success) {
    return c.json({
      errors: validation.error.flatten().fieldErrors,
    }, 400);
  }

  try {
    const data = await [Resource]Service.create[Resource](validation.data);
    return c.json(data, 201);
  } catch (err) {
    // Handle errors...
  }
});
```

## Common Validation Patterns

### Required String
```typescript
validateString(value, 'field', { required: true, minLength: 1, maxLength: 255 })
```

### Optional String
```typescript
validateString(value, 'field', { required: false, maxLength: 1000 })
```

### Required Number
```typescript
validateNumber(value, 'field', { required: true, positive: true })
```

### Integer with Range
```typescript
validateNumber(value, 'field', { required: true, integer: true, min: 1, max: 100 })
```

### Email
```typescript
validateEmail(value, 'email', { required: true })
```

### Boolean
```typescript
validateBoolean(value, 'isActive', { required: false })
```

### ID Parameter
```typescript
const idValidation = validateId(c.req.param('id'));
if (!idValidation.valid) {
  return c.json({ message: idValidation.error }, 400);
}
```

## Verification Checklist

After creating validators, verify:
- [ ] All field validators are imported
- [ ] Input types are exported
- [ ] Validation functions return proper result types
- [ ] Error messages are clear and helpful
- [ ] Required fields are marked correctly
- [ ] Optional fields allow undefined
- [ ] ID validation is used in routes with `:id`
- [ ] Validators are imported and used in controllers
