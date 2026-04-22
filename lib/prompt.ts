export const SYSTEM_PROMPT = `あなたは「難しいニュースや専門用語を、中学生にもわかる言葉と図解で説明する解説者」です。

ユーザーは以下のいずれかを入力します:
1. ニュース記事の本文（URLから取得済み、またはコピペ）
2. 専門用語・人物名・現象のキーワード

あなたは必ず provide_explanation ツールを使って、構造化された解説を返してください。

【ルール】
- 日本語で、中学生にも伝わる平易な言葉で説明する
- 専門用語は keyTerms に分けて解説する（必要なら5〜8個まで）
- 登場する重要な人物・組織があれば people に入れる（なければ空配列）
- 図解は flowchart / timeline / mindmap のうち、題材に最も適したものを1つ選ぶ
  - 因果関係・フロー → flowchart
  - 時系列の出来事 → timeline
  - 概念の構造・関連 → mindmap
- mermaidCode は Mermaid.js の正しい構文で出力する
  - ノードIDは必ず英数字のみ（例: A, B1, node2）。日本語は括弧内のラベルにのみ使用
  - 例: flowchart TD\n  A[日本銀行] --> B[金利の引き上げ]\n  B --> C[円高になる]
  - ラベル内で特殊記号（(), ", '）は使わない。使う場合はシンプルな語に置き換える
  - timeline の場合:\n    timeline\n      title タイトル\n      2020 : 出来事A\n      2021 : 出来事B
  - mindmap の場合:\n    mindmap\n      root((中心テーマ))\n        枝1\n          葉1
- summary は200〜300字程度でまとめる`;

export function buildUserMessage(params: {
  inputType: "url" | "keyword" | "longText";
  raw: string;
  article?: {
    title: string;
    content: string;
    siteName?: string;
    url: string;
  };
}): string {
  const { inputType, raw, article } = params;

  if (inputType === "url" && article) {
    return [
      `以下はニュース記事の本文です（元URL: ${article.url}${
        article.siteName ? ` / ${article.siteName}` : ""
      }）。`,
      `記事タイトル: ${article.title}`,
      "",
      "【本文】",
      article.content,
      "",
      "この記事の内容を、中学生にもわかるように要約し、登場する専門用語・人物を解説し、",
      "内容の核心を図解してください。",
    ].join("\n");
  }

  if (inputType === "longText") {
    return [
      "以下はニュース記事またはそれに類する長文テキストです。",
      "",
      "【本文】",
      raw,
      "",
      "内容を中学生にもわかるように要約し、専門用語・人物を解説し、図解してください。",
    ].join("\n");
  }

  return [
    `次のキーワードについて、中学生にもわかるように説明してください: 「${raw}」`,
    "",
    "意味、関連する人物や組織、関連する専門用語、全体像の図解を含めてください。",
  ].join("\n");
}

export const EXPLAIN_TOOL = {
  name: "provide_explanation",
  description:
    "ニュース記事またはキーワードの内容を、要約・用語解説・人物・図解の構造化データで返す",
  input_schema: {
    type: "object" as const,
    properties: {
      title: {
        type: "string",
        description: "解説の見出し（記事タイトルまたはキーワード）",
      },
      summary: {
        type: "string",
        description: "中学生にもわかる200〜300字程度の要約",
      },
      keyTerms: {
        type: "array",
        description: "記事に登場する重要な専門用語とその解説（0〜8個）",
        items: {
          type: "object",
          properties: {
            term: { type: "string", description: "専門用語" },
            explanation: {
              type: "string",
              description: "その用語の平易な説明（1〜3文）",
            },
          },
          required: ["term", "explanation"],
        },
      },
      people: {
        type: "array",
        description: "登場する重要な人物・組織（0〜5個）。なければ空配列",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "人物名または組織名" },
            role: { type: "string", description: "その人物・組織の役割や立場" },
          },
          required: ["name", "role"],
        },
      },
      mermaidType: {
        type: "string",
        enum: ["flowchart", "timeline", "mindmap"],
        description: "図解の種類",
      },
      mermaidCode: {
        type: "string",
        description:
          "Mermaid.js の正しい構文の図解コード。ノードIDは英数字のみ、日本語はラベルのみ",
      },
    },
    required: ["title", "summary", "keyTerms", "people", "mermaidType", "mermaidCode"],
  },
};

export type Explanation = {
  title: string;
  summary: string;
  keyTerms: { term: string; explanation: string }[];
  people: { name: string; role: string }[];
  mermaidType: "flowchart" | "timeline" | "mindmap";
  mermaidCode: string;
};
