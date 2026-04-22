import { Fragment, type ReactNode } from "react";
import { emojify } from "node-emoji";

// Minimal Slack mrkdwn → React renderer. Handles: *bold*, _italic_, ~strike~,
// `code`, ```code blocks```, <url|label>, <url>, <@U123>, line breaks. Good
// enough for triage display.

type Token =
  | { type: "text"; value: string }
  | { type: "bold"; children: Token[] }
  | { type: "italic"; children: Token[] }
  | { type: "strike"; children: Token[] }
  | { type: "code"; value: string }
  | { type: "codeblock"; value: string }
  | { type: "link"; href: string; label: string }
  | { type: "mention"; id: string; label?: string }
  | { type: "br" };

const STYLE_MARKERS: Array<[string, "bold" | "italic" | "strike"]> = [
  ["*", "bold"],
  ["_", "italic"],
  ["~", "strike"],
];

function isBoundary(input: string, idx: number): boolean {
  if (idx < 0 || idx >= input.length) return true;
  return /[\s.,!?;:()[\]{}'"`]/.test(input[idx]);
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === "`" && input.startsWith("```", i)) {
      const end = input.indexOf("```", i + 3);
      if (end !== -1) {
        tokens.push({ type: "codeblock", value: input.slice(i + 3, end) });
        i = end + 3;
        continue;
      }
    }

    if (ch === "`") {
      const end = input.indexOf("`", i + 1);
      if (end !== -1) {
        tokens.push({ type: "code", value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (ch === "<") {
      const end = input.indexOf(">", i + 1);
      if (end !== -1) {
        const inner = input.slice(i + 1, end);
        if (inner.startsWith("@")) {
          const [id, label] = inner.slice(1).split("|");
          tokens.push({ type: "mention", id, label: label || undefined });
        } else if (inner.startsWith("#")) {
          const name = inner.split("|")[1] ?? inner.slice(1);
          tokens.push({ type: "text", value: `#${name}` });
        } else if (/^https?:\/\//.test(inner) || /^mailto:/.test(inner)) {
          const [href, label] = inner.split("|");
          tokens.push({ type: "link", href, label: label || href });
        } else {
          tokens.push({ type: "text", value: `<${inner}>` });
        }
        i = end + 1;
        continue;
      }
    }

    if (ch === "\n") {
      tokens.push({ type: "br" });
      i++;
      continue;
    }

    let matchedStyle = false;
    for (const [marker, type] of STYLE_MARKERS) {
      if (ch !== marker) continue;
      if (!isBoundary(input, i - 1)) continue;
      const end = input.indexOf(marker, i + 1);
      if (end === -1 || end === i + 1) continue;
      if (!isBoundary(input, end + 1)) continue;
      const inner = input.slice(i + 1, end);
      if (inner.includes("\n")) continue;
      tokens.push({ type, children: tokenize(inner) });
      i = end + 1;
      matchedStyle = true;
      break;
    }
    if (matchedStyle) continue;

    // Plain text — accumulate until next special char.
    let j = i + 1;
    while (
      j < input.length &&
      input[j] !== "*" &&
      input[j] !== "_" &&
      input[j] !== "~" &&
      input[j] !== "`" &&
      input[j] !== "<" &&
      input[j] !== "\n"
    ) {
      j++;
    }
    tokens.push({ type: "text", value: input.slice(i, j) });
    i = j;
  }

  return tokens;
}

function render(tokens: Token[], keyPrefix = ""): ReactNode {
  return tokens.map((t, idx) => {
    const k = `${keyPrefix}-${idx}`;
    switch (t.type) {
      case "text":
        return <Fragment key={k}>{t.value}</Fragment>;
      case "br":
        return <br key={k} />;
      case "bold":
        return <strong key={k}>{render(t.children, k)}</strong>;
      case "italic":
        return <em key={k}>{render(t.children, k)}</em>;
      case "strike":
        return <s key={k}>{render(t.children, k)}</s>;
      case "code":
        return (
          <code key={k} className="rounded bg-slate-100 px-1 py-0.5 text-[0.9em] text-slate-800">
            {t.value}
          </code>
        );
      case "codeblock":
        return (
          <pre
            key={k}
            className="my-2 overflow-x-auto rounded bg-slate-100 p-3 text-xs text-slate-800"
          >
            <code>{t.value.replace(/^\n/, "")}</code>
          </pre>
        );
      case "link":
        return (
          <a
            key={k}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            {t.label}
          </a>
        );
      case "mention":
        return (
          <span key={k} className="rounded bg-blue-50 px-1 text-blue-700">
            @{t.label ?? t.id}
          </span>
        );
    }
  });
}

export function SlackText({ text }: { text: string }) {
  if (!text) return null;
  // Convert :shortcode: emoji to unicode (e.g. :rotating_light: → 🚨).
  // Unknown shortcodes (custom Slack emoji) are left as-is by node-emoji.
  const emojified = emojify(text);
  return <span className="whitespace-pre-wrap">{render(tokenize(emojified))}</span>;
}
