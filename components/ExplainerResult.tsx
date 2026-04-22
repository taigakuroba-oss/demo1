"use client";

import { MermaidDiagram } from "./MermaidDiagram";
import type { Explanation } from "@/lib/prompt";

type Props = {
  explanation: Explanation;
  sourceUrl?: string;
  siteName?: string;
};

export function ExplainerResult({ explanation, sourceUrl, siteName }: Props) {
  return (
    <article className="result">
      <header className="result-header">
        <h2>{explanation.title}</h2>
        {sourceUrl && (
          <p className="result-source">
            出典:{" "}
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
              {siteName || sourceUrl}
            </a>
          </p>
        )}
      </header>

      <section className="result-section">
        <h3>図解</h3>
        <MermaidDiagram code={explanation.mermaidCode} />
      </section>

      <section className="result-section">
        <h3>要約</h3>
        <p className="result-summary">{explanation.summary}</p>
      </section>

      {explanation.keyTerms.length > 0 && (
        <section className="result-section">
          <h3>専門用語の解説</h3>
          <dl className="result-terms">
            {explanation.keyTerms.map((t) => (
              <div key={t.term} className="result-term">
                <dt>{t.term}</dt>
                <dd>{t.explanation}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {explanation.people.length > 0 && (
        <section className="result-section">
          <h3>登場する人物・組織</h3>
          <ul className="result-people">
            {explanation.people.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong>
                <span>{p.role}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
