"use client";

import { useState } from "react";
import { ExplainerResult } from "./ExplainerResult";
import type { Explanation } from "@/lib/prompt";

type ApiResponse = {
  inputType: "url" | "keyword" | "longText";
  sourceUrl?: string;
  siteName?: string;
  explanation: Explanation;
};

export function ExplainForm() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResponse | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "エラーが発生しました。");
      } else {
        setResult(data as ApiResponse);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form className="explain-form" onSubmit={onSubmit}>
        <label htmlFor="input" className="form-label">
          記事のURL、わからない用語、または本文をそのまま入力
        </label>
        <textarea
          id="input"
          className="form-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            "例:\nhttps://www3.nhk.or.jp/news/...\nまたは「量子もつれ」\nまたは記事本文をコピペ"
          }
          rows={6}
          disabled={loading}
        />
        <button
          type="submit"
          className="form-submit"
          disabled={loading || !input.trim()}
        >
          {loading ? "解説を生成中…" : "図解で解説する"}
        </button>
      </form>

      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-box">
          <p>AIが内容を理解して図解を作成しています…（10〜30秒ほどかかります）</p>
        </div>
      )}

      {result && (
        <ExplainerResult
          explanation={result.explanation}
          sourceUrl={result.sourceUrl}
          siteName={result.siteName}
        />
      )}
    </>
  );
}
