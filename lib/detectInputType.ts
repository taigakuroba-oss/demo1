export type InputType = "url" | "keyword" | "longText";

export function detectInputType(raw: string): InputType {
  const trimmed = raw.trim();
  if (/^https?:\/\/\S+$/i.test(trimmed)) return "url";
  if (trimmed.length > 200) return "longText";
  return "keyword";
}
