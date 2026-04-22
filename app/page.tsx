import { ExplainForm } from "@/components/ExplainForm";

export default function HomePage() {
  return (
    <main className="page">
      <header className="hero">
        <h1>ニュース図解解説</h1>
        <p className="hero-sub">
          難しいニュースも、URL・キーワード・本文を貼り付けるだけで
          <br />
          AIがやさしい言葉と<strong>図解</strong>で解説します。
        </p>
      </header>
      <ExplainForm />
      <footer className="footer">
        <p>Powered by Claude + Mermaid.js</p>
      </footer>
    </main>
  );
}
