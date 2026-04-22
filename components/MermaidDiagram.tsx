"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  code: string;
};

export function MermaidDiagram({ code }: Props) {
  const baseId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "strict",
          fontFamily:
            "system-ui, -apple-system, 'Hiragino Sans', 'Yu Gothic', sans-serif",
        });
        const renderId = `mmd-${baseId}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, code);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "図の描画に失敗しました";
          setError(message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, baseId]);

  if (error) {
    return (
      <div className="mermaid-fallback">
        <p className="mermaid-error">図の描画に失敗しました</p>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  return <div ref={containerRef} className="mermaid-container" />;
}
