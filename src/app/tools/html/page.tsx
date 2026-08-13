"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import * as beautify from "js-beautify";

type PageChromeMode = "once" | "repeat";
type CodeViewMode = "generated" | "source";

const htmlTokenPattern = /(<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?[a-zA-Z][\s\S]*?>)/gi;
const tagTokenPattern = /("[^"]*"|'[^']*'|=|\/|<|>|[^\s=<>/]+)/g;
const cssTokenPattern = /(\/\*[\s\S]*?\*\/|#[\w-]+|\.[\w-]+|[\w-]+(?=\s*:)|#[0-9a-fA-F]{3,8}\b|-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b|"[^"]*"|'[^']*'|[{}:;(),]|\s+|.)/g;
const jsTokenPattern = /(\/\/.*|\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|`[^`]*`|\b(?:const|let|var|function|return|if|else|for|while|document|window)\b|\b[\w$]+(?=\()|[={}();,.]|\s+|.)/g;

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const starterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Live HTML Preview</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f6f8fa;
      color: #24292f;
    }

    main {
      width: min(640px, calc(100vw - 48px));
      padding: 32px;
      border: 1px solid #d0d7de;
      border-radius: 12px;
      background: white;
      box-shadow: 0 20px 60px rgba(31, 35, 40, 0.08);
    }

    h1 {
      margin: 0 0 12px;
      font-size: 32px;
    }

    p {
      margin: 0;
      line-height: 1.65;
      color: #57606a;
    }
  </style>
</head>
<body>
  <main>
    <h1>Hello HTML</h1>
    <p>Edit the code on the left. The preview updates instantly.</p>
  </main>
</body>
</html>`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function injectBeforeBodyClose(html: string, fragment: string) {
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${fragment}\n</body>`);
  return `${html}\n${fragment}`;
}

function injectIntoHead(html: string, fragment: string) {
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${fragment}\n</head>`);
  // Anything placed before the doctype puts the document into quirks mode.
  const doctype = /^\s*<!doctype[^>]*>/i.exec(html);
  if (doctype) {
    const insertAt = doctype[0].length;
    return `${html.slice(0, insertAt)}\n${fragment}${html.slice(insertAt)}`;
  }
  return `${fragment}\n${html}`;
}

function renderTagToken(token: string, key: string) {
  if (token === "<" || token === ">" || token === "/" || token === "=") {
    return (
      <span key={key} className="text-[#ff7ac6]">
        {token}
      </span>
    );
  }

  if ((token.startsWith("\"") && token.endsWith("\"")) || (token.startsWith("'") && token.endsWith("'"))) {
    return (
      <span key={key} className="text-[#f7ff87]">
        {token}
      </span>
    );
  }

  if (/^[a-zA-Z][\w:-]*$/.test(token)) {
    return (
      <span key={key} className={key.endsWith("-1") ? "text-[#ff7ac6]" : "text-[#4dff88]"}>
        {token}
      </span>
    );
  }

  return (
    <span key={key} className="text-[#d4d4d4]">
      {token}
    </span>
  );
}

function renderHighlightedTag(tag: string, keyPrefix: string) {
  const matches = tag.match(tagTokenPattern) || [tag];
  let tagNameSeen = false;

  return matches.map((token, index) => {
    const tokenKey = `${keyPrefix}-${index}`;
    if (!tagNameSeen && /^[a-zA-Z][\w:-]*$/.test(token)) {
      tagNameSeen = true;
      return (
        <span key={`${tokenKey}-1`} className="text-[#ff7ac6]">
          {token}
        </span>
      );
    }

    return renderTagToken(token, tokenKey);
  });
}

function renderHighlightedCss(value: string, keyPrefix: string) {
  // Track the running offset: looking the token up with indexOf would always
  // find its FIRST occurrence, mis-colouring every repeat of an identifier.
  let offset = 0;

  return (value.match(cssTokenPattern) || [value]).map((token, index) => {
    const key = `${keyPrefix}-css-${index}`;
    const tokenEnd = offset + token.length;
    offset = tokenEnd;

    if (/^\s+$/.test(token)) return <span key={key}>{token}</span>;
    if (token.startsWith("/*")) return <span key={key} className="text-[#6a9955]">{token}</span>;
    if (/^#[\w-]+$/.test(token) || /^\.[\w-]+$/.test(token)) return <span key={key} className="text-[#4dff88]">{token}</span>;
    if (/^[\w-]+$/.test(token) && value.slice(tokenEnd).trimStart().startsWith(":")) {
      return <span key={key} className="text-[#64dfff]">{token}</span>;
    }
    if (/^#[0-9a-fA-F]{3,8}$/.test(token) || /^-?\d/.test(token)) return <span key={key} className="text-[#c792ea]">{token}</span>;
    if ((token.startsWith("\"") && token.endsWith("\"")) || (token.startsWith("'") && token.endsWith("'"))) {
      return <span key={key} className="text-[#f7ff87]">{token}</span>;
    }
    if (/^[{}:;(),]$/.test(token)) return <span key={key} className="text-[#f8f8f2]">{token}</span>;
    return <span key={key} className="text-[#c792ea]">{token}</span>;
  });
}

function renderHighlightedScript(value: string, keyPrefix: string) {
  return (value.match(jsTokenPattern) || [value]).map((token, index) => {
    const key = `${keyPrefix}-js-${index}`;
    if (/^\s+$/.test(token)) return <span key={key}>{token}</span>;
    if (token.startsWith("//") || token.startsWith("/*")) return <span key={key} className="text-[#6a9955]">{token}</span>;
    if ((token.startsWith("\"") && token.endsWith("\"")) || (token.startsWith("'") && token.endsWith("'")) || (token.startsWith("`") && token.endsWith("`"))) {
      return <span key={key} className="text-[#f7ff87]">{token}</span>;
    }
    if (/^(const|let|var|function|return|if|else|for|while|document|window)$/.test(token)) {
      return <span key={key} className="text-[#64dfff]">{token}</span>;
    }
    if (/^[\w$]+$/.test(token)) return <span key={key} className="text-[#4dff88]">{token}</span>;
    if (/^[={}();,.]$/.test(token)) return <span key={key} className="text-[#ff7ac6]">{token}</span>;
    return <span key={key} className="text-[#f8f8f2]">{token}</span>;
  });
}

function renderHighlightedText(value: string, key: string, mode: "html" | "css" | "script") {
  if (!value) return null;
  if (mode === "css") return renderHighlightedCss(value, key);
  if (mode === "script") return renderHighlightedScript(value, key);

  return (
    <span key={key} className="text-[#f8f8f2]">
      {value}
    </span>
  );
}

function renderHighlightedHtml(value: string) {
  const chunks = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let mode: "html" | "css" | "script" = "html";
  htmlTokenPattern.lastIndex = 0;

  while ((match = htmlTokenPattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      chunks.push(renderHighlightedText(value.slice(lastIndex, match.index), `text-${lastIndex}`, mode));
    }

    const token = match[0];
    if (token.startsWith("<!--")) {
      chunks.push(
        <span key={`comment-${match.index}`} className="text-[#6a9955]">
          {token}
        </span>,
      );
    } else if (/^<!doctype/i.test(token)) {
      chunks.push(
        <span key={`doctype-${match.index}`} className="text-[#c586c0]">
          {token}
        </span>,
      );
    } else {
      chunks.push(...renderHighlightedTag(token, `tag-${match.index}`));
      if (/^<style[\s>]/i.test(token)) mode = "css";
      if (/^<\/style/i.test(token)) mode = "html";
      if (/^<script[\s>]/i.test(token)) mode = "script";
      if (/^<\/script/i.test(token)) mode = "html";
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < value.length) {
    chunks.push(renderHighlightedText(value.slice(lastIndex), `text-${lastIndex}`, mode));
  }

  return chunks;
}

function buildPageChromeHtml({
  html,
  headerEnabled,
  footerEnabled,
  headerText,
  footerText,
  headerMode,
  footerMode,
}: {
  html: string;
  headerEnabled: boolean;
  footerEnabled: boolean;
  headerText: string;
  footerText: string;
  headerMode: PageChromeMode;
  footerMode: PageChromeMode;
}) {
  const safeHeader = escapeHtml(headerText.trim());
  const safeFooter = escapeHtml(footerText.trim());
  const hasHeader = headerEnabled && safeHeader;
  const hasFooter = footerEnabled && safeFooter;

  if (!hasHeader && !hasFooter) return html;

  const headerClass = headerMode === "repeat" ? "dt-page-header dt-repeat" : "dt-page-header dt-once";
  const footerClass = footerMode === "repeat" ? "dt-page-footer dt-repeat" : "dt-page-footer dt-once";
  const headerMarkup = hasHeader ? `<header class="${headerClass}">${safeHeader}</header>` : "";
  const footerMarkup = hasFooter ? `<footer class="${footerClass}">${safeFooter}</footer>` : "";
  const repeatHeader = hasHeader && headerMode === "repeat";
  const repeatFooter = hasFooter && footerMode === "repeat";
  const onceHeader = hasHeader && headerMode === "once";
  const onceFooter = hasFooter && footerMode === "once";

  const style = `<style>
  .dt-page-header,
  .dt-page-footer {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 24px;
    font: 12px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #57606a;
    background: rgba(255,255,255,0.96);
    border-color: #d0d7de;
  }
  .dt-page-header { border-bottom: 1px solid #d0d7de; }
  .dt-page-footer { border-top: 1px solid #d0d7de; }
  .dt-page-header.dt-once { margin-bottom: 24px; }
  .dt-page-footer.dt-once { margin-top: 24px; }
  .dt-page-header.dt-repeat {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 2147483647;
  }
  .dt-page-footer.dt-repeat {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 2147483647;
  }
  @media screen {
    body {
      ${repeatHeader ? "padding-top: 44px !important;" : ""}
      ${repeatFooter ? "padding-bottom: 44px !important;" : ""}
    }
  }
  @media print {
    body {
      ${repeatHeader ? "padding-top: 48px !important;" : ""}
      ${repeatFooter ? "padding-bottom: 48px !important;" : ""}
    }
    .dt-page-header.dt-repeat,
    .dt-page-footer.dt-repeat {
      position: fixed;
    }
  }
</style>`;

  let nextHtml = injectIntoHead(html, style);
  if (onceHeader || repeatHeader) {
    nextHtml = nextHtml.replace(/<body([^>]*)>/i, `<body$1>\n${headerMarkup}`);
    if (!/<body[^>]*>/i.test(nextHtml)) nextHtml = `${headerMarkup}\n${nextHtml}`;
  }
  if (onceFooter || repeatFooter) {
    nextHtml = injectBeforeBodyClose(nextHtml, footerMarkup);
  }

  return nextHtml;
}

export default function HTMLEditorPage() {
  const [code, setCode] = useState(starterHtml);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [wrap, setWrap] = useState(true);
  const [showPageChrome, setShowPageChrome] = useState(false);
  const [headerEnabled, setHeaderEnabled] = useState(false);
  const [footerEnabled, setFooterEnabled] = useState(false);
  const [headerText, setHeaderText] = useState("DEBUGTOOLS / HTML Preview");
  const [footerText, setFooterText] = useState("Generated with DebugTools - Page 1");
  const [headerMode, setHeaderMode] = useState<PageChromeMode>("repeat");
  const [footerMode, setFooterMode] = useState<PageChromeMode>("repeat");
  const [codeViewMode, setCodeViewMode] = useState<CodeViewMode>("generated");
  const [editorScroll, setEditorScroll] = useState({ left: 0, top: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const outputHtml = useMemo(
    () => buildPageChromeHtml({
      html: code,
      headerEnabled,
      footerEnabled,
      headerText,
      footerText,
      headerMode,
      footerMode,
    }),
    [code, footerEnabled, footerMode, footerText, headerEnabled, headerMode, headerText],
  );
  const previewDoc = useMemo(() => outputHtml, [outputHtml]);
  const displayCode = codeViewMode === "generated" ? outputHtml : code;
  const isGeneratedView = codeViewMode === "generated";
  const lineCount = useMemo(() => Math.max(1, displayCode.split("\n").length), [displayCode]);
  const highlightedCode = useMemo(() => renderHighlightedHtml(displayCode), [displayCode]);

  const notifyCopied = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputHtml);
      setErrorMessage("");
      notifyCopied();
    } catch {
      setErrorMessage("Could not copy to clipboard.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([outputHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "index.html";
    // Firefox only honours the click when the anchor is in the document, and
    // revoking the URL synchronously cancels the download in flight.
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleFormat = () => {
    setCode(beautify.html(code, { indent_size: 2, wrap_line_length: 120 }));
  };

  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setErrorMessage(`File is too large (limit ${MAX_FILE_BYTES / (1024 * 1024)} MB).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setErrorMessage("");
      setCode(String(reader.result || ""));
    };
    reader.onerror = () => {
      setErrorMessage("Could not read that file.");
    };
    reader.readAsText(file);
  };

  return (
    <main className="flex h-[calc(100vh-56px)] min-h-[640px] flex-col bg-[#f6f8fa] text-[#24292f]">
      <header className="sticky top-0 z-30 shrink-0 border-b border-[#d0d7de] bg-white px-3 py-2 shadow-[0_1px_0_rgba(31,35,40,0.04)]">
        <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#6e7781]">tools / html</p>
            <h1 className="mt-1 text-xl font-semibold text-[#24292f]">HTML Live Preview</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCode(starterHtml)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d0d7de] bg-white px-3 text-sm font-semibold text-[#24292f] hover:bg-[#f6f8fa]"
            >
              <DocumentPlusIcon className="h-4 w-4" />
              New
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d0d7de] bg-white px-3 text-sm font-semibold text-[#24292f] hover:bg-[#f6f8fa]"
            >
              <FolderOpenIcon className="h-4 w-4" />
              Open
            </button>
            <button
              type="button"
              onClick={handleFormat}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d0d7de] bg-white px-3 text-sm font-semibold text-[#24292f] hover:bg-[#f6f8fa]"
            >
              <SparklesIcon className="h-4 w-4" />
              Format
            </button>
            <button
              type="button"
              onClick={() => setShowPageChrome((value) => !value)}
              className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${
                showPageChrome
                  ? "border-[#24292f] bg-[#24292f] text-white hover:bg-[#32383f] hover:text-white"
                  : "border-[#d0d7de] bg-white text-[#24292f] hover:bg-[#f6f8fa]"
              }`}
            >
              <DocumentTextIcon className="h-4 w-4" />
              Header/Footer
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d0d7de] bg-white px-3 text-sm font-semibold text-[#24292f] hover:bg-[#f6f8fa]"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#24292f] px-3 text-sm font-semibold text-white hover:bg-[#32383f] hover:text-white"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Download
            </button>
            <input ref={fileInputRef} type="file" accept=".html,.htm,.txt" className="hidden" onChange={handleOpenFile} />
          </div>
        </div>
        {errorMessage && (
          <p role="alert" className="mt-2 rounded-md border border-[#ffc1c0] bg-[#fff5f5] px-3 py-1.5 text-sm text-[#cf222e]">
            {errorMessage}
          </p>
        )}
        {showPageChrome && (
          <div className="mt-2 grid gap-2 border-t border-[#d0d7de] pt-2 lg:grid-cols-2">
            <div className="grid gap-2 rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#24292f]">
                <input
                  type="checkbox"
                  checked={headerEnabled}
                  onChange={(event) => setHeaderEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-[#d0d7de]"
                />
                Header
              </label>
              <input
                value={headerText}
                onChange={(event) => setHeaderText(event.target.value)}
                placeholder="Header text"
                className="h-9 min-w-0 rounded-md border border-[#d0d7de] bg-white px-3 text-sm text-[#24292f] outline-none focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/15"
              />
              <select
                value={headerMode}
                onChange={(event) => setHeaderMode(event.target.value as PageChromeMode)}
                className="h-9 rounded-md border border-[#d0d7de] bg-white px-2 text-sm font-semibold text-[#24292f] outline-none focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/15"
              >
                <option value="repeat">Repeat every page</option>
                <option value="once">One page only</option>
              </select>
            </div>
            <div className="grid gap-2 rounded-md border border-[#d0d7de] bg-[#f6f8fa] p-2 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#24292f]">
                <input
                  type="checkbox"
                  checked={footerEnabled}
                  onChange={(event) => setFooterEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-[#d0d7de]"
                />
                Footer
              </label>
              <input
                value={footerText}
                onChange={(event) => setFooterText(event.target.value)}
                placeholder="Footer text"
                className="h-9 min-w-0 rounded-md border border-[#d0d7de] bg-white px-3 text-sm text-[#24292f] outline-none focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/15"
              />
              <select
                value={footerMode}
                onChange={(event) => setFooterMode(event.target.value as PageChromeMode)}
                className="h-9 rounded-md border border-[#d0d7de] bg-white px-2 text-sm font-semibold text-[#24292f] outline-none focus:border-[#0969da] focus:ring-2 focus:ring-[#0969da]/15"
              >
                <option value="repeat">Repeat every page</option>
                <option value="once">One page only</option>
              </select>
            </div>
          </div>
        )}
      </header>

      <section className="grid min-h-0 w-full flex-1 gap-2 p-2 lg:grid-cols-2">
        <section className="flex min-h-[320px] min-w-0 flex-col overflow-hidden rounded-md border border-[#202330] bg-[#292b36] shadow-sm">
          <div className="flex h-10 items-center justify-between border-b border-[#202330] bg-[#242733] pl-0 pr-3">
            <div className="flex h-full items-center">
              <div className="flex h-full border-r border-[#202330] bg-[#242733]">
                {(["generated", "source"] as CodeViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setCodeViewMode(mode);
                      setEditorScroll({ left: 0, top: 0 });
                    }}
                    className={`flex h-full items-center px-4 font-mono text-xs font-semibold ${
                      codeViewMode === mode
                        ? "bg-[#292b36] text-[#f8f8f2]"
                        : "text-[#89a9a5] hover:bg-[#303442] hover:text-[#f8f8f2]"
                    }`}
                  >
                    {mode === "generated" ? "generated.html" : "source.html"}
                  </button>
                ))}
              </div>
              <span className="hidden px-3 font-mono text-[11px] text-[#858585] sm:inline">
                {isGeneratedView ? "Header/footer output" : "Editable source"}
              </span>
              <span className="hidden items-center gap-3 px-3 font-mono text-[11px] text-[#858585] xl:flex">
                <span><span className="text-[#ff7ac6]">#FF7AC6</span> tags</span>
                <span><span className="text-[#4dff88]">#4DFF88</span> attrs</span>
                <span><span className="text-[#f7ff87]">#F7FF87</span> strings</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWrap((value) => !value)}
              className="rounded px-2 py-1 text-xs font-semibold text-[#d7daf0] hover:bg-[#303442] hover:text-white"
            >
              {wrap ? "Wrap on" : "Wrap off"}
            </button>
          </div>
          {/* The gutter renders one fixed-height row per logical line, so it
              cannot stay aligned once a line wraps: hide it while wrap is on. */}
          <div className={`grid min-h-0 flex-1 overflow-hidden bg-[#292b36] ${
            wrap ? "grid-cols-[minmax(0,1fr)]" : "grid-cols-[56px_minmax(0,1fr)]"
          }`}>
            {!wrap && (
              <div
                aria-hidden="true"
                className="overflow-hidden border-r border-[#202330] bg-[#292b36] px-2 py-4 text-right font-mono text-[16px] leading-7 text-[#89a9a5]"
              >
                <div style={{ transform: `translateY(-${editorScroll.top}px)` }}>
                  {Array.from({ length: lineCount }, (_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="relative min-h-0 overflow-hidden bg-[#292b36]">
              <pre
                aria-hidden="true"
                className={`pointer-events-none absolute left-0 top-0 z-20 min-h-full min-w-full overflow-hidden px-4 py-4 font-mono text-[16px] leading-7 ${
                  wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                }`}
                style={{ transform: `translate(${-editorScroll.left}px, -${editorScroll.top}px)` }}
              >
                {highlightedCode}
              </pre>
              <textarea
                value={displayCode}
                onChange={(event) => {
                  if (!isGeneratedView) setCode(event.target.value);
                }}
                onScroll={(event) => {
                  setEditorScroll({
                    left: event.currentTarget.scrollLeft,
                    top: event.currentTarget.scrollTop,
                  });
                }}
                readOnly={isGeneratedView}
                spellCheck={false}
                className={`dt-code-textarea absolute inset-0 z-10 h-full w-full resize-none overflow-auto border-0 bg-[#292b36] px-4 py-4 font-mono text-[16px] leading-7 text-transparent caret-[#f8f8f2] outline-none selection:bg-[#4b5d7a]/80 ${
                  wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                }`}
                style={{
                  appearance: "none",
                  backgroundColor: "#292b36",
                  backgroundImage: "none",
                  color: "transparent",
                  WebkitAppearance: "none",
                  WebkitTextFillColor: "transparent",
                }}
                aria-label={isGeneratedView ? "Generated HTML output" : "HTML source"}
              />
            </div>
          </div>
          <div className="flex h-7 items-center justify-between border-t border-[#202330] bg-[#1f6feb] px-3 font-mono text-[11px] text-white">
            <span>{isGeneratedView ? "Generated output includes header/footer" : "Source is editable"}</span>
            <span>{lineCount} lines</span>
          </div>
        </section>

        <section className="flex min-h-[320px] min-w-0 flex-col overflow-hidden rounded-md border border-[#d0d7de] bg-white">
          <div className="flex h-10 items-center justify-between border-b border-[#d0d7de] bg-[#f6f8fa] px-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-[#57606a]">Preview</span>
            <span className="rounded-full bg-[#dafbe1] px-2 py-0.5 text-[11px] font-semibold text-[#1a7f37]">Live</span>
          </div>
          <iframe
            title="Live HTML preview"
            srcDoc={previewDoc}
            sandbox="allow-scripts allow-forms allow-modals allow-popups"
            className="min-h-0 flex-1 bg-white"
          />
        </section>
      </section>
    </main>
  );
}
