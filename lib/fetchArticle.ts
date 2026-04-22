import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export type FetchedArticle = {
  title: string;
  content: string;
  siteName?: string;
  excerpt?: string;
  url: string;
};

export async function fetchArticle(url: string): Promise<FetchedArticle> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  let html: string;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NewsVisualExplainerBot/1.0; +https://example.com/bot)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      throw new Error(`URLの取得に失敗しました (HTTP ${res.status})`);
    }
    html = await res.text();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("URLの取得がタイムアウトしました（10秒）");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const parsed = reader.parse();

  if (!parsed || !parsed.textContent || parsed.textContent.trim().length < 100) {
    throw new Error(
      "本文の抽出に失敗しました。記事本文をテキストでコピペして入力してください。"
    );
  }

  return {
    title: parsed.title || "",
    content: parsed.textContent.trim().slice(0, 15000),
    siteName: parsed.siteName ?? undefined,
    excerpt: parsed.excerpt ?? undefined,
    url,
  };
}
