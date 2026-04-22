import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ニュース図解解説 | News Visual Explainer",
  description:
    "URL・キーワード・本文から、難しいニュースを図解とやさしい言葉で解説します。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
