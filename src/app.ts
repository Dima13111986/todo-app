import express, { Request, Response } from "express";

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export let todos: Todo[] = [];
export let nextId = 1;

export function resetStore() {
  todos = [];
  nextId = 1;
}

const app = express();
app.use(express.json());

// GET /todos — список задач
app.get("/todos", (req: Request, res: Response) => {
  const { status } = req.query;

  if (status === "active") {
    res.json(todos.filter((t) => !t.completed));
    return;
  }
  if (status === "completed") {
    res.json(todos.filter((t) => t.completed));
    return;
  }
  if (status !== undefined && status !== "all") {
    res
      .status(400)
      .json({ error: "Invalid status. Use: all, active, completed" });
    return;
  }

  res.json(todos);
});

// POST /todos — додати задачу
app.post("/todos", (req: Request, res: Response) => {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ error: 'Field "title" is required' });
    return;
  }

  const todo: Todo = {
    id: nextId++,
    title: title.trim(),
    completed: false,
  };

  todos.push(todo);
  res.status(201).json(todo);
});

// DELETE /todos/:id — видалити задачу
app.delete("/todos/:id", (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);

  if (isNaN(id) || id <= 0) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    res.status(404).json({ error: `Todo with id ${id} not found` });
    return;
  }

  const [deleted] = todos.splice(index, 1);
  res.json(deleted);
});

export default app;
