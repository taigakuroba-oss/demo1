const express = require('express');
const cors = require('cors');
const { getDb } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// --- Helpers ---
async function getTaskWithTags(db, id) {
  const task = await db.get(
    'SELECT t.*, c.name AS category_name, c.color AS category_color FROM tasks t LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = ?',
    id
  );
  if (!task) return null;
  task.tags = await db.all(
    'SELECT tg.id, tg.name FROM tags tg JOIN task_tags tt ON tg.id = tt.tag_id WHERE tt.task_id = ?',
    id
  );
  return task;
}

async function syncTags(db, taskId, tagNames) {
  await db.run('DELETE FROM task_tags WHERE task_id = ?', taskId);
  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    let tag = await db.get('SELECT id FROM tags WHERE name = ?', trimmed);
    if (!tag) {
      const res = await db.run('INSERT INTO tags (name) VALUES (?)', trimmed);
      tag = { id: res.lastID };
    }
    await db.run('INSERT OR IGNORE INTO task_tags (task_id, tag_id) VALUES (?, ?)', taskId, tag.id);
  }
}

// --- Tasks ---
app.get('/api/tasks', async (req, res) => {
  try {
    const db = await getDb();
    const { status, priority, category_id, tag, search } = req.query;
    let sql = 'SELECT t.*, c.name AS category_name, c.color AS category_color FROM tasks t LEFT JOIN categories c ON t.category_id = c.id WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND t.status = ?'; params.push(status); }
    if (priority) { sql += ' AND t.priority = ?'; params.push(priority); }
    if (category_id) { sql += ' AND t.category_id = ?'; params.push(category_id); }
    if (search) { sql += ' AND (t.title LIKE ? OR t.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (tag) {
      sql += ' AND t.id IN (SELECT tt.task_id FROM task_tags tt JOIN tags tg ON tt.tag_id = tg.id WHERE tg.name = ?)';
      params.push(tag);
    }
    sql += ' ORDER BY CASE t.priority WHEN "high" THEN 1 WHEN "medium" THEN 2 ELSE 3 END, t.due_date ASC, t.created_at DESC';
    const tasks = await db.all(sql, ...params);
    for (const task of tasks) {
      task.tags = await db.all(
        'SELECT tg.id, tg.name FROM tags tg JOIN task_tags tt ON tg.id = tt.tag_id WHERE tt.task_id = ?',
        task.id
      );
    }
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const db = await getDb();
    const task = await getTaskWithTags(db, req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    res.json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const db = await getDb();
    const { title, description, status, priority, due_date, category_id, tags = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const result = await db.run(
      'INSERT INTO tasks (title, description, status, priority, due_date, category_id) VALUES (?, ?, ?, ?, ?, ?)',
      title, description || null, status || 'pending', priority || 'medium', due_date || null, category_id || null
    );
    await syncTags(db, result.lastID, tags);
    res.status(201).json(await getTaskWithTags(db, result.lastID));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { title, description, status, priority, due_date, category_id, tags } = req.body;
    const existing = await db.get('SELECT id FROM tasks WHERE id = ?', req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await db.run(
      `UPDATE tasks SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        due_date = ?,
        category_id = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      title ?? null, description ?? null, status ?? null, priority ?? null,
      due_date !== undefined ? (due_date || null) : undefined,
      category_id !== undefined ? (category_id || null) : undefined,
      req.params.id
    );
    if (Array.isArray(tags)) await syncTags(db, req.params.id, tags);
    res.json(await getTaskWithTags(db, req.params.id));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM tasks WHERE id = ?', req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Categories ---
app.get('/api/categories', async (_req, res) => {
  try {
    const db = await getDb();
    res.json(await db.all('SELECT * FROM categories ORDER BY name'));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const db = await getDb();
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const result = await db.run('INSERT INTO categories (name, color) VALUES (?, ?)', name, color || '#6366f1');
    res.status(201).json(await db.get('SELECT * FROM categories WHERE id = ?', result.lastID));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.run('DELETE FROM categories WHERE id = ?', req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Tags ---
app.get('/api/tags', async (_req, res) => {
  try {
    const db = await getDb();
    res.json(await db.all('SELECT * FROM tags ORDER BY name'));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  await getDb();
  console.log(`Backend running on http://localhost:${PORT}`);
});
