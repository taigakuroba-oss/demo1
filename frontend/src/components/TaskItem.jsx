import React from 'react';

const PRIORITY_STYLE = {
  high: { label: '高', bg: '#fee2e2', color: '#dc2626' },
  medium: { label: '中', bg: '#fef3c7', color: '#d97706' },
  low: { label: '低', bg: '#dcfce7', color: '#16a34a' },
};

const STATUS_STYLE = {
  pending: { label: '未着手', bg: '#f1f5f9', color: '#64748b' },
  in_progress: { label: '進行中', bg: '#dbeafe', color: '#2563eb' },
  completed: { label: '完了', bg: '#d1fae5', color: '#059669' },
};

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'completed') return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export default function TaskItem({ task, onEdit, onDelete, onStatusChange }) {
  const pri = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.medium;
  const sta = STATUS_STYLE[task.status] || STATUS_STYLE.pending;
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div style={{ ...styles.card, borderLeft: `4px solid ${pri.color}`, opacity: task.status === 'completed' ? 0.75 : 1 }}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <input
            type="checkbox"
            checked={task.status === 'completed'}
            onChange={(e) => onStatusChange(task.id, e.target.checked ? 'completed' : 'pending')}
            style={styles.checkbox}
          />
          <span style={{ ...styles.title, textDecoration: task.status === 'completed' ? 'line-through' : 'none', color: task.status === 'completed' ? '#94a3b8' : '#1e293b' }}>
            {task.title}
          </span>
        </div>
        <div style={styles.actions}>
          <button style={styles.btnEdit} onClick={() => onEdit(task)}>編集</button>
          <button style={styles.btnDelete} onClick={() => onDelete(task.id)}>削除</button>
        </div>
      </div>

      {task.description && <p style={styles.description}>{task.description}</p>}

      <div style={styles.meta}>
        <span style={{ ...styles.badge, background: pri.bg, color: pri.color }}>優先度: {pri.label}</span>
        <span style={{ ...styles.badge, background: sta.bg, color: sta.color }}>{sta.label}</span>
        {task.category_name && (
          <span style={{ ...styles.badge, background: task.category_color + '22', color: task.category_color, border: `1px solid ${task.category_color}44` }}>
            {task.category_name}
          </span>
        )}
        {task.due_date && (
          <span style={{ ...styles.badge, background: overdue ? '#fee2e2' : '#f1f5f9', color: overdue ? '#dc2626' : '#64748b' }}>
            {overdue ? '⚠ ' : ''}期限: {task.due_date}
          </span>
        )}
        {(task.tags || []).map((tag) => (
          <span key={tag.id} style={styles.tag}>#{tag.name}</span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 8 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8, flex: 1 },
  checkbox: { width: 16, height: 16, accentColor: '#6366f1', flexShrink: 0 },
  title: { fontSize: 15, fontWeight: 600, lineHeight: 1.4 },
  actions: { display: 'flex', gap: 6, flexShrink: 0 },
  btnEdit: { padding: '4px 12px', border: '1.5px solid #e2e8f0', borderRadius: 6, background: '#fff', fontSize: 12, fontWeight: 600, color: '#475569' },
  btnDelete: { padding: '4px 12px', border: '1.5px solid #fee2e2', borderRadius: 6, background: '#fff', fontSize: 12, fontWeight: 600, color: '#ef4444' },
  description: { fontSize: 13, color: '#64748b', marginLeft: 24, lineHeight: 1.5 },
  meta: { display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 24 },
  badge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, border: '1px solid transparent' },
  tag: { fontSize: 11, color: '#6366f1', fontWeight: 600 },
};
