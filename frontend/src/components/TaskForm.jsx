import React, { useState, useEffect } from 'react';

const PRIORITY_OPTIONS = [
  { value: 'high', label: '高', color: '#ef4444' },
  { value: 'medium', label: '中', color: '#f59e0b' },
  { value: 'low', label: '低', color: '#22c55e' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
];

export default function TaskForm({ task, categories, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    category_id: '',
    tags: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date || '',
        category_id: task.category_id || '',
        tags: (task.tags || []).map((t) => t.name).join(', '),
      });
    }
  }, [task]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const tags = form.tags.split(',').map((s) => s.trim()).filter(Boolean);
    onSubmit({ ...form, category_id: form.category_id || null, tags });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{task ? 'タスクを編集' : 'タスクを作成'}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            タイトル <span style={styles.required}>*</span>
            <input style={styles.input} value={form.title} onChange={set('title')} required placeholder="タスクのタイトル" />
          </label>
          <label style={styles.label}>
            説明
            <textarea style={{ ...styles.input, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={set('description')} placeholder="詳細説明（任意）" />
          </label>
          <div style={styles.row}>
            <label style={{ ...styles.label, flex: 1 }}>
              ステータス
              <select style={styles.input} value={form.status} onChange={set('status')}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label style={{ ...styles.label, flex: 1 }}>
              優先度
              <select style={styles.input} value={form.priority} onChange={set('priority')}>
                {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>
          <div style={styles.row}>
            <label style={{ ...styles.label, flex: 1 }}>
              期限日
              <input style={styles.input} type="date" value={form.due_date} onChange={set('due_date')} />
            </label>
            <label style={{ ...styles.label, flex: 1 }}>
              カテゴリ
              <select style={styles.input} value={form.category_id} onChange={set('category_id')}>
                <option value="">なし</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <label style={styles.label}>
            タグ（カンマ区切り）
            <input style={styles.input} value={form.tags} onChange={set('tags')} placeholder="例: 仕事, 重要, レビュー" />
          </label>
          <div style={styles.actions}>
            <button type="button" style={styles.btnCancel} onClick={onCancel}>キャンセル</button>
            <button type="submit" style={styles.btnSubmit}>{task ? '更新' : '作成'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1e293b' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  label: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, fontWeight: 600, color: '#475569' },
  required: { color: '#ef4444' },
  input: { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, color: '#1e293b', outline: 'none', background: '#f8fafc', transition: 'border-color .15s' },
  row: { display: 'flex', gap: 12 },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 },
  btnCancel: { padding: '9px 20px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600 },
  btnSubmit: { padding: '9px 24px', border: 'none', borderRadius: 8, background: '#6366f1', color: '#fff', fontSize: 14, fontWeight: 600 },
};
