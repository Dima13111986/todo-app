import request from 'supertest';
import app, { resetStore, todos } from '../app';

beforeEach(() => {
  resetStore();
});

describe('GET /todos', () => {
  it('повертає порожній масив якщо задач немає', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('повертає список існуючих задач', async () => {
    await request(app).post('/todos').send({ title: 'Задача 1' });
    await request(app).post('/todos').send({ title: 'Задача 2' });

    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ title: 'Задача 1', completed: false });
    expect(res.body[1]).toMatchObject({ title: 'Задача 2', completed: false });
  });
});

describe('POST /todos', () => {
  it('створює нову задачу та повертає її', async () => {
    const res = await request(app).post('/todos').send({ title: 'Купити молоко' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      title: 'Купити молоко',
      completed: false,
    });
  });

  it('обрізає пробіли в title', async () => {
    const res = await request(app).post('/todos').send({ title: '  Прибрати  ' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Прибрати');
  });

  it('повертає 400 якщо title відсутній', async () => {
    const res = await request(app).post('/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('повертає 400 якщо title порожній рядок', async () => {
    const res = await request(app).post('/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('повертає 400 якщо title не рядок', async () => {
    const res = await request(app).post('/todos').send({ title: 123 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('кожна задача отримує унікальний id', async () => {
    const res1 = await request(app).post('/todos').send({ title: 'A' });
    const res2 = await request(app).post('/todos').send({ title: 'B' });
    expect(res1.body.id).not.toBe(res2.body.id);
  });
});

describe('DELETE /todos/:id', () => {
  it('видаляє задачу та повертає її', async () => {
    const created = await request(app).post('/todos').send({ title: 'Видалити мене' });
    const { id } = created.body;

    const res = await request(app).delete(`/todos/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id, title: 'Видалити мене' });

    const list = await request(app).get('/todos');
    expect(list.body).toHaveLength(0);
  });

  it('повертає 404 якщо задача не знайдена', async () => {
    const res = await request(app).delete('/todos/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('повертає 400 якщо id не число', async () => {
    const res = await request(app).delete('/todos/abc');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('повертає 400 якщо id <= 0', async () => {
    const resZero = await request(app).delete('/todos/0');
    expect(resZero.status).toBe(400);
    expect(resZero.body).toHaveProperty('error');

    const resNeg = await request(app).delete('/todos/-1');
    expect(resNeg.status).toBe(400);
    expect(resNeg.body).toHaveProperty('error');
  });

  it('видаляє лише вказану задачу, решта залишається', async () => {
    const a = await request(app).post('/todos').send({ title: 'A' });
    const b = await request(app).post('/todos').send({ title: 'B' });
    const c = await request(app).post('/todos').send({ title: 'C' });

    await request(app).delete(`/todos/${b.body.id}`);

    const list = await request(app).get('/todos');
    expect(list.body).toHaveLength(2);
    expect(list.body.map((t: { id: number }) => t.id)).toEqual([a.body.id, c.body.id]);
  });
});

describe('GET /todos?status=', () => {
  beforeEach(async () => {
    await request(app).post('/todos').send({ title: 'Active task' });
    await request(app).post('/todos').send({ title: 'Completed task' });
    // Mark second todo as completed directly via the exported store
    todos[1].completed = true;
  });

  it('повертає всі задачі без параметра', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('?status=all повертає всі задачі', async () => {
    const res = await request(app).get('/todos?status=all');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('?status=active повертає лише незавершені задачі', async () => {
    const res = await request(app).get('/todos?status=active');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ title: 'Active task', completed: false });
  });

  it('?status=completed повертає лише завершені задачі', async () => {
    const res = await request(app).get('/todos?status=completed');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ title: 'Completed task', completed: true });
  });

  it('?status=invalid повертає 400', async () => {
    const res = await request(app).get('/todos?status=invalid');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
