import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Eye, Info, Sparkles, Clock, Search, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { topics as initialTopics, timeWindows, type TopicStatus } from "@/data/mockData";
import { StatusBadge, SourceBadge } from "@/components/StatusBadges";
import DateTimeRangePicker, { type DateTimeRange } from "@/components/DateTimeRangePicker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtRange = (r: DateTimeRange) =>
  `${r.from.getFullYear()}-${pad2(r.from.getMonth() + 1)}-${pad2(r.from.getDate())} ${pad2(r.from.getHours())}:00 ~ ${r.to.getFullYear()}-${pad2(r.to.getMonth() + 1)}-${pad2(r.to.getDate())} ${pad2(r.to.getHours())}:00`;

// 模拟自定义范围跨度对应的数据规模（默认 1 小时拉取量级在万级）
const estimateForRange = (r: DateTimeRange) => {
  const hours = Math.max(1, Math.round((r.to.getTime() - r.from.getTime()) / 3_600_000));
  const negativeCount = Math.min(2_000_000, Math.round(12000 * hours));
  const topicCount = Math.min(500, Math.max(20, Math.round(20 + 8 * Math.log2(hours + 1))));
  return { negativeCount, topicCount, visibleCount: 20 };
};

const STATUS_OPTIONS: TopicStatus[] = ["待处理", "持续关注", "已处理", "误报"];

const AnalysisList = () => {
  const [topics, setTopics] = useState(initialTopics);
  const [windowKey, setWindowKey] = useState("1h");
  const [customRange, setCustomRange] = useState<DateTimeRange | undefined>();
  const [misreportOpen, setMisreportOpen] = useState(false);
  const [misreportTopicId, setMisreportTopicId] = useState<string | null>(null);
  const [misreportReason, setMisreportReason] = useState("");

  const currentWindow = timeWindows.find((w) => w.key === windowKey)!;

  const windowMeta = useMemo(() => {
    if (customRange) return estimateForRange(customRange);
    const map: Record<string, { topicCount: number; negativeCount: number; visibleCount: number }> = {
      "1h": { topicCount: 86, negativeCount: 12480, visibleCount: 20 },
      "6h": { topicCount: 142, negativeCount: 68_500, visibleCount: 20 },
      "24h": { topicCount: 218, negativeCount: 256_400, visibleCount: 20 },
      "7d": { topicCount: 342, negativeCount: 1_624_000, visibleCount: 20 },
      "30d": { topicCount: 486, negativeCount: 6_842_000, visibleCount: 20 },
    };
    return map[windowKey];
  }, [windowKey, customRange]);

  const windowLabel = customRange ? fmtRange(customRange) : currentWindow.windowLabel;

  // 来源选项 = 所有主题中出现过的来源去重
  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    initialTopics.forEach((t) => t.sources.forEach((s) => set.add(s)));
    return Array.from(set);
  }, []);

  // 搜索 + 筛选 + 排序
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TopicStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"count_desc" | "count_asc">("count_desc");

  const filteredTopics = useMemo(() => {
    const kw = search.trim();
    let list = topics.filter((t) => {
      const matchSearch =
        !kw ||
        t.name.includes(kw) ||
        t.summary.includes(kw) ||
        t.keywords.some((k) => k.includes(kw));
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchSource = sourceFilter === "all" || t.sources.includes(sourceFilter);
      return matchSearch && matchStatus && matchSource;
    });
    list = list.slice().sort((a, b) =>
      sortBy === "count_desc" ? b.count - a.count : a.count - b.count
    );
    return list;
  }, [topics, search, statusFilter, sourceFilter, sortBy]);

  const hasActiveFilter = search.trim() !== "" || statusFilter !== "all" || sourceFilter !== "all";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSourceFilter("all");
    setSortBy("count_desc");
  };


  const updateStatus = (id: string, status: TopicStatus) => {
    if (status === "误报") {
      setMisreportTopicId(id);
      setMisreportReason("");
      setMisreportOpen(true);
      return;
    }
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`已更新为「${status}」`);
  };

  const confirmMisreport = () => {
    if (!misreportTopicId) return;
    setTopics((prev) => prev.map((t) => (t.id === misreportTopicId ? { ...t, status: "误报" } : t)));
    setMisreportOpen(false);
    toast.success("主题已标记为误报");
  };

  const misreportTopic = topics.find((t) => t.id === misreportTopicId);

  return (
    <AppLayout
      breadcrumbs={[{ label: "智能分析" }]}
      actions={
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="mr-1.5 h-4 w-4" />聚类方法
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 text-sm">
              <h4 className="mb-2 font-semibold">聚类方法说明</h4>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                当前时间范围内的负面日志会先做文本向量化（标题 + 摘要 embedding），
                再基于 HDBSCAN 做自动聚类。
              </p>
              <div className="rounded-md bg-muted p-3 text-xs space-y-1">
                <div className="font-medium">展示规则</div>
                <div className="text-muted-foreground">· 按每个类下挂载的负面日志数量倒序排序</div>
                <div className="text-muted-foreground">· 页面展示 Top 20 类</div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      }
    >
      <div className="space-y-5">
        {/* 顶层时间筛选 */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              时间范围
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {timeWindows.map((w) => (
                <button
                  key={w.key}
                  onClick={() => { setWindowKey(w.key); setCustomRange(undefined); }}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs transition-colors",
                    !customRange && windowKey === w.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {w.label}
                </button>
              ))}
              <DateTimeRangePicker value={customRange} onChange={setCustomRange} />
              {customRange && (
                <button
                  onClick={() => setCustomRange(undefined)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  清除自定义
                </button>
              )}
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              当前窗口：<span className="font-medium text-foreground tabular-nums">{windowLabel}</span>
            </div>
          </div>
        </Card>

        {/* 概览指标 */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="text-xs text-muted-foreground">当前窗口负面日志</div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tabular-nums text-destructive">{windowMeta.negativeCount.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">条</span>
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground">聚类主题</div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tabular-nums">{windowMeta.topicCount}</span>
              <span className="text-xs text-muted-foreground">个 · 展示 Top {windowMeta.visibleCount}</span>
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-muted-foreground">待处理主题</div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-semibold tabular-nums text-warning">{topics.filter((t) => t.status === "待处理").length}</span>
              <span className="text-xs text-muted-foreground">个</span>
            </div>
          </Card>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-info/20 bg-info-soft px-4 py-3 text-xs text-info">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            系统对当前时间范围内的负面日志做 embedding，并基于 <strong>HDBSCAN</strong> 自动聚类；
            按每个类下挂载的负面日志数排序，展示 Top 20 主题。
          </span>
        </div>

        <Card>
          {/* 搜索 + 筛选条 */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索主题名称 / 摘要 / 关键词"
                className="h-9 pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | TopicStatus)}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="处理状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-9 w-32">
                <SelectValue placeholder="主要来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                {sourceOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "count_desc" | "count_asc")}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="count_desc">日志数 · 由多到少</SelectItem>
                <SelectItem value="count_asc">日志数 · 由少到多</SelectItem>
              </SelectContent>
            </Select>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={resetFilters}>
                <X className="mr-1 h-3.5 w-3.5" />重置
              </Button>
            )}
            <div className="ml-auto text-xs text-muted-foreground">
              共 <span className="font-semibold text-foreground tabular-nums">{filteredTopics.length}</span> 个主题
              {hasActiveFilter && <span className="ml-1">（筛选自 {topics.length} 个）</span>}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16">序号</TableHead>
                <TableHead>主题名称</TableHead>
                <TableHead className="w-28 text-right">负面日志数</TableHead>
                <TableHead className="w-32">时间范围</TableHead>
                <TableHead className="w-56">主要来源</TableHead>
                <TableHead className="w-36">处理状态</TableHead>
                <TableHead className="w-20 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTopics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    没有符合条件的主题，试试调整搜索或筛选条件
                  </TableCell>
                </TableRow>
              )}
              {filteredTopics.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</TableCell>
                  <TableCell>
                    <Link to={`/analysis/${t.id}`} className="font-medium hover:text-primary">
                      {t.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md bg-destructive-soft px-2 text-xs font-semibold tabular-nums text-destructive">
                      {t.count.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{t.timeRange}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.sources.map((s) => (
                        <SourceBadge key={s} source={s} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v as TopicStatus)}>
                      <SelectTrigger className="h-8 w-32 border-transparent bg-transparent px-2 hover:border-border">
                        <SelectValue>
                          <StatusBadge status={t.status} />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                      <Link to={`/analysis/${t.id}`}>
                        <Eye className="mr-1 h-3.5 w-3.5" />详情
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={misreportOpen} onOpenChange={setMisreportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>标记为误报</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-md bg-muted p-3 text-sm">
              <span className="text-muted-foreground">当前主题：</span>
              <span className="font-medium">{misreportTopic?.name}</span>
            </div>
            <div className="space-y-2">
              <Label>原因说明</Label>
              <Textarea
                placeholder="如：聚类结果不准确，主题不成立"
                value={misreportReason}
                onChange={(e) => setMisreportReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMisreportOpen(false)}>取消</Button>
            <Button onClick={confirmMisreport}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default AnalysisList;
