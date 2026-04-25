import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import CategoryManager from './components/CategoryManager';

const INITIAL_FILTERS = { search: '', status: '', priority: '', category_id: '', tag: '' };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCatMgr, setShowCatMgr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const data = await api.getTasks(filters);
      setTasks(data);
      setError('');
    } catch (e) {
      setError('タスクの取得に失敗しました。バックエンドが起動しているか確認してください。');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadMeta = useCallback(async () => {
    const [cats, tgs] = await Promise.all([api.getCategories(), api.getTags()]);
    setCategories(cats);
    setTags(tgs);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { loadMeta(); }, [loadMeta]);

  const handleCreate = async (data) => {
    await api.createTask(data);
    setShowForm(false);
    loadTasks();
    loadMeta();
  };

  const handleUpdate = async (data) => {
    await api.updateTask(editingTask.id, data);
    setEditingTask(null);
    loadTasks();
    loadMeta();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('このタスクを削除しますか？')) return;
    await api.deleteTask(id);
    loadTasks();
  };

  const handleStatusChange = async (id, status) => {
    await api.updateTask(id, { status });
    loadTasks();
  };

  const counts = {
    all: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => t.due_date && t.status !== 'completed' && new Date(t.due_date) < new Date(new Date().toDateString())).length,
  };

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.appTitle}>タスク管理</h1>
            <p style={styles.subtitle}>
              全 {counts.all} 件 ・ 完了 {counts.completed} 件{counts.overdue > 0 && <span style={styles.overdueCount}> ・ 期限超過 {counts.overdue} 件</span>}
            </p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.btnSecondary} onClick={() => setShowCatMgr(true)}>カテゴリ管理</button>
            <button style={styles.btnPrimary} onClick={() => setShowForm(true)}>+ タスクを追加</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <FilterBar filters={filters} categories={categories} tags={tags} onChange={setFilters} />

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.empty}>読み込み中...</div>
        ) : tasks.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📋</p>
            <p>タスクがありません</p>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>右上の「+ タスクを追加」から作成してください</p>
          </div>
        ) : (
          <div style={styles.list}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEdit={(t) => setEditingTask(t)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </main>

      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask || null}
          categories={categories}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}

      {showCatMgr && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCatMgr(false)}
          onUpdate={loadMeta}
        />
      )}
    </div>
  );
}

const styles = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100 },
  headerInner: { maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  appTitle: { fontSize: 22, fontWeight: 800, color: '#6366f1' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  overdueCount: { color: '#ef4444', fontWeight: 700 },
  headerActions: { display: 'flex', gap: 10 },
  btnPrimary: { padding: '9px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700 },
  btnSecondary: { padding: '9px 16px', background: '#fff', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontWeight: 600 },
  main: { flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { textAlign: 'center', padding: 60, color: '#64748b', fontSize: 15 },
  error: { background: '#fee2e2', color: '#dc2626', borderRadius: 8, padding: '10px 16px', fontSize: 14 },
};
