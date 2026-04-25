import React, { useState } from 'react';
import { api } from '../api';

const PRESET_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ef4444'];

export default function CategoryManager({ categories, onClose, onUpdate }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.createCategory({ name: name.trim(), color });
      setName('');
      onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('カテゴリを削除しますか？（タスクのカテゴリは解除されます）')) return;
    await api.deleteCategory(id);
    onUpdate();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>カテゴリ管理</h2>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleAdd} style={styles.form}>
          <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="カテゴリ名" />
          <div style={styles.colors}>
            {PRESET_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} style={{ ...styles.colorDot, background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: 2 }} />
            ))}
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 12 }}>{error}</p>}
          <button type="submit" style={styles.btnAdd}>追加</button>
        </form>
        <ul style={styles.list}>
          {categories.map((c) => (
            <li key={c.id} style={styles.item}>
              <span style={{ ...styles.dot, background: c.color }} />
              <span style={styles.catName}>{c.name}</span>
              <button style={styles.btnDel} onClick={() => handleDelete(c.id)}>削除</button>
            </li>
          ))}
          {categories.length === 0 && <li style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 12 }}>カテゴリがありません</li>}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 12, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 700 },
  close: { background: 'none', border: 'none', fontSize: 18, color: '#94a3b8', padding: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  input: { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' },
  colors: { display: 'flex', gap: 8 },
  colorDot: { width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer' },
  btnAdd: { padding: '8px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 },
  item: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#f8fafc', borderRadius: 8 },
  dot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  catName: { flex: 1, fontSize: 14 },
  btnDel: { padding: '3px 10px', border: '1.5px solid #fee2e2', borderRadius: 6, background: '#fff', fontSize: 12, color: '#ef4444', cursor: 'pointer' },
};
