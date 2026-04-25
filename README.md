# タスク管理システム

Node.js + React + SQLite で構築したタスク管理 Web アプリケーションです。

## 機能

- **タスク CRUD** — 作成・表示・更新・削除
- **優先度管理** — 高 / 中 / 低の 3 段階
- **期限管理** — 期限日の設定、期限超過の警告表示
- **ステータス管理** — 未着手 / 進行中 / 完了
- **カテゴリ** — カラー付きカテゴリの作成・割り当て
- **タグ** — カンマ区切りで複数タグを付与
- **フィルタ・検索** — ステータス / 優先度 / カテゴリ / タグ / キーワードで絞り込み

## 起動方法

### バックエンド

```bash
cd backend
npm install
npm start        # http://localhost:3001
```

### フロントエンド

```bash
cd frontend
npm install
npm start        # http://localhost:3000
```

## 技術スタック

| 層 | 技術 |
|---|---|
| フロントエンド | React (Create React App) |
| バックエンド | Node.js + Express |
| データベース | SQLite (`sqlite` + `sqlite3`) |

## ディレクトリ構成

```
.
├── backend/
│   ├── server.js      # Express API サーバー
│   ├── database.js    # SQLite 初期化
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── api.js
    │   └── components/
    │       ├── TaskItem.jsx
    │       ├── TaskForm.jsx
    │       ├── FilterBar.jsx
    │       └── CategoryManager.jsx
    └── package.json
```
