import { KeyboardEvent, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  className?: string;
  /** 当字符总数已达上限时，禁止继续添加 */
  maxTotalChars?: number;
  /** 自定义分隔符正则，默认空格/回车/Tab/中英文逗号、分号、顿号 */
  splitRegex?: RegExp;
}

const DEFAULT_SPLIT = /\n+/;

export const TagsInput = ({
  value,
  onChange,
  placeholder = "输入后按回车添加",
  className,
  maxTotalChars,
  splitRegex = DEFAULT_SPLIT,
}: TagsInputProps) => {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentChars = value.join("").length;

  const commitTokens = (raw: string) => {
    const tokens = raw.split(splitRegex).map((t) => t.trim()).filter(Boolean);
    if (tokens.length === 0) return;
    const merged = [...value];
    let totalLen = currentChars;
    for (const t of tokens) {
      if (merged.includes(t)) continue;
      if (maxTotalChars !== undefined && totalLen + t.length > maxTotalChars) break;
      merged.push(t);
      totalLen += t.length;
    }
    if (merged.length !== value.length) onChange(merged);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 仅在回车时分词
    if (e.key === "Enter") {
      e.preventDefault();
      if (draft.trim()) {
        commitTokens(draft);
        setDraft("");
      }
      return;
    }
    // 退格 -> 当输入为空时删除最后一个标签
    if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    // 粘贴包含换行时按换行分词
    if (/\n/.test(text)) {
      e.preventDefault();
      commitTokens(draft + text);
      setDraft("");
    }
  };

  const removeTag = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div
      className={cn(
        "flex w-full cursor-text flex-wrap items-start gap-2 rounded-md border border-input bg-background p-2.5",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        className,
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
        >
          <span className="break-all">{tag}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(i);
            }}
            className="flex h-3.5 w-3.5 items-center justify-center rounded-sm transition-colors hover:bg-primary-foreground/20"
            aria-label={`删除 ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          if (draft.trim()) {
            commitTokens(draft);
            setDraft("");
          }
        }}
        placeholder={value.length === 0 ? placeholder : "按回车继续添加"}
        className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default TagsInput;
