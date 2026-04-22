# ニュース図解解説 (News Visual Explainer)

難しいニュース記事や専門用語を、**図解とやさしい言葉**で説明してくれる Web アプリ。
URL・キーワード・本文のいずれを貼り付けても OK。AI (Claude) が内容を理解し、要約・用語解説・人物一覧・Mermaid 図を返します。

## セットアップ

```bash
npm install
cp .env.local.example .env.local
# .env.local を開き ANTHROPIC_API_KEY を設定
npm run dev
```

`http://localhost:3000` を開いて、入力欄に URL やキーワード、記事本文を貼り付けてください。

## ビルド

```bash
npm run build
npm start
```

## 技術スタック

- Next.js 15 (App Router, TypeScript)
- Claude API (`@anthropic-ai/sdk`) — モデル: `claude-sonnet-4-6`
- Mermaid.js (図解のレンダリング)
- Mozilla Readability + jsdom (URL からの本文抽出)

## ディレクトリ

- `app/page.tsx` — トップページ
- `app/api/explain/route.ts` — Claude を呼び出す API
- `lib/` — 入力判別・記事取得・プロンプト定義
- `components/` — フォーム・結果表示・Mermaid 描画
