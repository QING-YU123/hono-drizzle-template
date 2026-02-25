import { Hono } from 'hono';
import { UserService } from '../services/user.service';

const userController = new Hono();

userController.get('/', async (c) => {
    const data = await UserService.getAllUsers();
    return c.json(data);
});

userController.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
        return c.json({ message: 'Invalid id' }, 400);
    }

    const data = await UserService.getUserById(id);
    if (!data) {
        return c.json({ message: 'User not found' }, 404);
    }
    return c.json(data);
});

userController.post('/', async (c) => {
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ message: 'Invalid JSON body' }, 400);
    }

    const { name, email } = (body ?? {}) as { name?: unknown; email?: unknown };
    if (typeof name !== 'string' || name.trim().length === 0) {
        return c.json({ message: 'name is required' }, 400);
    }
    if (typeof email !== 'string' || email.trim().length === 0) {
        return c.json({ message: 'email is required' }, 400);
    }

    try {
        const data = await UserService.createUser({
            name: name.trim(),
            email: email.trim(),
        });
        return c.json(data, 201);
    } catch (err) {
        // Postgres unique_violation
        if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
            return c.json({ message: 'Email already exists' }, 409);
        }
        throw err;
    }
});

userController.put('/:id', async (c) => {
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

    const { name, email } = (body ?? {}) as { name?: unknown; email?: unknown };
    const payload: { name?: string; email?: string } = {};

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            return c.json({ message: 'name must be a non-empty string' }, 400);
        }
        payload.name = name.trim();
    }

    if (email !== undefined) {
        if (typeof email !== 'string' || email.trim().length === 0) {
            return c.json({ message: 'email must be a non-empty string' }, 400);
        }
        payload.email = email.trim();
    }

    if (!payload.name && !payload.email) {
        return c.json({ message: 'Nothing to update' }, 400);
    }

    try {
        const data = await UserService.updateUser(id, payload);
        if (!data) {
            return c.json({ message: 'User not found' }, 404);
        }
        return c.json(data);
    } catch (err) {
        if (typeof err === 'object' && err && 'code' in err && (err as any).code === '23505') {
            return c.json({ message: 'Email already exists' }, 409);
        }
        throw err;
    }
});

userController.delete('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
        return c.json({ message: 'Invalid id' }, 400);
    }

    const data = await UserService.deleteUser(id);
    if (!data) {
        return c.json({ message: 'User not found' }, 404);
    }

    return c.json({ message: 'Deleted', data });
});




export default userController;