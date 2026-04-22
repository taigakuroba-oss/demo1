import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic } from "@/lib/anthropic";
import { detectInputType } from "@/lib/detectInputType";
import { fetchArticle } from "@/lib/fetchArticle";
import {
  SYSTEM_PROMPT,
  buildUserMessage,
  EXPLAIN_TOOL,
  type Explanation,
} from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: { input?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const input = (body.input ?? "").trim();
  if (!input) {
    return NextResponse.json(
      { error: "解説したいURL、キーワード、または本文を入力してください。" },
      { status: 400 }
    );
  }

  const inputType = detectInputType(input);
  let article: Awaited<ReturnType<typeof fetchArticle>> | undefined;

  if (inputType === "url") {
    try {
      article = await fetchArticle(input);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "URLの取得でエラーが発生しました。";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const userMessage = buildUserMessage({ inputType, raw: input, article });

  let client: Anthropic;
  try {
    client = getAnthropic();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "APIクライアントの初期化に失敗しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: [EXPLAIN_TOOL],
      tool_choice: { type: "tool", name: "provide_explanation" },
      messages: [{ role: "user", content: userMessage }],
    });

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    if (!toolUse) {
      return NextResponse.json(
        { error: "解説の生成に失敗しました。もう一度お試しください。" },
        { status: 502 }
      );
    }

    const explanation = toolUse.input as Explanation;

    return NextResponse.json({
      inputType,
      sourceUrl: article?.url,
      siteName: article?.siteName,
      explanation,
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY が無効です。" },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "APIのレート制限に達しました。しばらく待って再試行してください。" },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `APIエラー: ${err.message}` },
        { status: err.status ?? 500 }
      );
    }
    const message = err instanceof Error ? err.message : "不明なエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
