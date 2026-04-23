import { useMemo } from "react";

interface WordCloudItem {
  text: string;
  weight: number;
}

interface WordCloudProps {
  words: WordCloudItem[];
  className?: string;
}

// 词频云：根据 weight 计算字号 + 颜色深度，错落排列模拟标签云
const WordCloud = ({ words, className }: WordCloudProps) => {
  const enriched = useMemo(() => {
    if (words.length === 0) return [];
    const max = Math.max(...words.map((w) => w.weight));
    const min = Math.min(...words.map((w) => w.weight));
    const range = Math.max(1, max - min);
    return words
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .map((w, i) => {
        const t = (w.weight - min) / range; // 0..1
        // 字号区间：12px ~ 32px
        const fontSize = 12 + t * 20;
        // 颜色权重：高权重接近 primary，低权重偏 muted-foreground
        const intensity = 0.35 + t * 0.65; // 0.35..1
        return { ...w, fontSize, intensity, key: `${w.text}-${i}` };
      });
  }, [words]);

  // 重排成视觉错落感：按权重大小交替插入到中间和两端
  const ordered = useMemo(() => {
    const left: typeof enriched = [];
    const right: typeof enriched = [];
    enriched.forEach((w, i) => (i % 2 === 0 ? left.push(w) : right.unshift(w)));
    return [...left, ...right];
  }, [enriched]);

  if (ordered.length === 0) {
    return <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">暂无词频数据</div>;
  }

  const maxWeight = enriched[0].weight;

  return (
    <div className={className}>
      <div className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-md border border-border bg-gradient-to-br from-primary-soft/30 via-background to-background px-6 py-8">
        {ordered.map((w) => (
          <span
            key={w.key}
            title={`${w.text} · 出现 ${w.weight} 次`}
            className="inline-flex cursor-default items-baseline transition-all hover:scale-110"
            style={{
              fontSize: `${w.fontSize}px`,
              lineHeight: 1.2,
              color: `hsl(var(--primary) / ${w.intensity})`,
              fontWeight: w.intensity > 0.75 ? 700 : w.intensity > 0.55 ? 600 : 500,
              letterSpacing: w.intensity > 0.8 ? "-0.01em" : "normal",
            }}
          >
            {w.text}
            <sup
              className="ml-0.5 tabular-nums text-muted-foreground/70"
              style={{ fontSize: `${Math.max(9, w.fontSize * 0.4)}px` }}
            >
              {w.weight}
            </sup>
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>共 {enriched.length} 个高频词</span>
        <span>最高词频：{maxWeight} 次</span>
      </div>
    </div>
  );
};

export default WordCloud;
