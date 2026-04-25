import React from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'pending', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

export default function FilterBar({ filters, categories, tags, onChange }) {
  const set = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <div style={styles.bar}>
      <input
        style={styles.search}
        type="search"
        placeholder="タスクを検索..."
        value={filters.search}
        onChange={set('search')}
      />
      <select style={styles.select} value={filters.status} onChange={set('status')}>
        <optgroup label="ステータス">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </optgroup>
      </select>
      <select style={styles.select} value={filters.priority} onChange={set('priority')}>
        <optgroup label="優先度">
          {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </optgroup>
      </select>
      <select style={styles.select} value={filters.category_id} onChange={set('category_id')}>
        <option value="">カテゴリ: すべて</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select style={styles.select} value={filters.tag} onChange={set('tag')}>
        <option value="">タグ: すべて</option>
        {tags.map((t) => <option key={t.id} value={t.name}>#{t.name}</option>)}
      </select>
    </div>
  );
}

const styles = {
  bar: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  search: { flex: '1 1 200px', padding: '8px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' },
  select: { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff', outline: 'none', color: '#475569' },
};
