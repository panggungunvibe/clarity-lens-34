import { Link } from "react-router-dom";
import { Eye, AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { negativeLogs, timeWindows } from "@/data/mockData";
import { SentimentBadge, SourceBadge } from "@/components/StatusBadges";
import DateTimeRangePicker, { type DateTimeRange } from "@/components/DateTimeRangePicker";
import TablePagination from "@/components/TablePagination";
import { cn } from "@/lib/utils";


const pad2 = (n: number) => String(n).padStart(2, "0");
const fmtRange = (r: DateTimeRange) =>
  `${r.from.getFullYear()}-${pad2(r.from.getMonth() + 1)}-${pad2(r.from.getDate())} ${pad2(r.from.getHours())}:00 ~ ${r.to.getFullYear()}-${pad2(r.to.getMonth() + 1)}-${pad2(r.to.getDate())} ${pad2(r.to.getHours())}:00`;

const AlertList = () => {
  const [windowKey, setWindowKey] = useState("1h");
  const [customRange, setCustomRange] = useState<DateTimeRange | undefined>();
  const [search, setSearch] = useState("");
  const [strategy, setStrategy] = useState("all");
  const [source, setSource] = useState("all");
  const [sentiment, setSentiment] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 任意筛选条件变化时重置回第一页
  useEffect(() => {
    setPage(1);
  }, [windowKey, customRange, search, strategy, source, sentiment]);

  const currentWindow = timeWindows.find((w) => w.key === windowKey)!;
  const windowOrder = ["1h", "6h", "24h", "7d", "30d"];
  const currentIdx = windowOrder.indexOf(windowKey);

  const filtered = useMemo(() => {
    return negativeLogs.filter((l) => {
      let inWindow = true;
      if (customRange) {
        const t = new Date(l.publishedAt.replace(" ", "T")).getTime();
        inWindow = t >= customRange.from.getTime() && t <= customRange.to.getTime();
      } else {
        const logIdx = windowOrder.indexOf(l.windowKey);
        inWindow = logIdx >= 0 && logIdx <= currentIdx;
      }
      const matchSearch = !search || l.title.includes(search) || l.author.includes(search);
      const matchStrategy = strategy === "all" || l.strategy === strategy;
      const matchSource = source === "all" || l.source === source;
      const matchSentiment = sentiment === "all" || l.sentiment === sentiment;
      return inWindow && matchSearch && matchStrategy && matchSource && matchSentiment;
    });
  }, [windowKey, customRange, search, strategy, source, sentiment, currentIdx]);

  const windowLabel = customRange ? fmtRange(customRange) : currentWindow.windowLabel;

  return (
    <AppLayout breadcrumbs={[{ label: "告警日志" }]}>
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
              <DateTimeRangePicker
                value={customRange}
                onChange={(r) => { setCustomRange(r); }}
              />
              {customRange && (
                <button
                  onClick={() => setCustomRange(undefined)}
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  清除自定义
                </button>
              )}
            </div>
            <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
              <div>
                当前窗口：<span className="font-medium text-foreground tabular-nums">{windowLabel}</span>
              </div>
              <div className="flex items-baseline gap-1.5 rounded-md bg-destructive-soft px-3 py-1.5">
                <span className="text-destructive">负面日志</span>
                <span className="text-base font-semibold text-destructive tabular-nums">{filtered.length}</span>
                <span className="text-destructive">条</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          {/* 条件筛选 */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger className="h-9 w-44"><SelectValue placeholder="策略" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部策略</SelectItem>
                <SelectItem value="某品牌监测策略">某品牌监测策略</SelectItem>
                <SelectItem value="某品牌终端口碑策略">某品牌终端口碑策略</SelectItem>
              </SelectContent>
            </Select>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="h-9 w-32"><SelectValue placeholder="来源" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="微博">微博</SelectItem>
                <SelectItem value="小红书">小红书</SelectItem>
                <SelectItem value="论坛">论坛</SelectItem>
                <SelectItem value="新闻">新闻</SelectItem>
                <SelectItem value="黑猫投诉">黑猫投诉</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sentiment} onValueChange={setSentiment}>
              <SelectTrigger className="h-9 w-36"><SelectValue placeholder="情感等级" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部情感</SelectItem>
                <SelectItem value="轻度负面">轻度负面</SelectItem>
                <SelectItem value="中度负面">中度负面</SelectItem>
                <SelectItem value="重度负面">重度负面</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="关键词搜索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-60"
            />
            <Button size="sm">查询</Button>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStrategy("all"); setSource("all"); setSentiment("all"); }}>重置</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16">序号</TableHead>
                <TableHead className="max-w-0">
                  <span className="block truncate">标题</span>
                </TableHead>
                <TableHead className="w-28 whitespace-nowrap">来源</TableHead>
                <TableHead className="w-28 whitespace-nowrap">情感</TableHead>
                <TableHead className="w-44">发布时间</TableHead>
                <TableHead className="w-32 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    当前时间范围内暂无负面日志
                  </TableCell>
                </TableRow>
              )}
              {filtered.slice((page - 1) * pageSize, page * pageSize).map((log, i) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground tabular-nums">{String((page - 1) * pageSize + i + 1).padStart(2, "0")}</TableCell>
                  <TableCell className="max-w-0">
                    <Link to={`/alerts/${log.id}`} className="block truncate font-medium hover:text-primary" title={log.title}>
                      {log.title}
                    </Link>
                  </TableCell>
                  <TableCell><SourceBadge source={log.source} /></TableCell>
                  <TableCell><SentimentBadge sentiment={log.sentiment} /></TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{log.publishedAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                        <Link to={`/alerts/${log.id}`}>
                          <Eye className="mr-1 h-3.5 w-3.5" />详情
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-primary">
                        <a href={log.url} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filtered.length > 0 && (
            <div className="border-t border-border">
              <TablePagination
                total={filtered.length}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
              />
            </div>
          )}

          <div className="flex items-start gap-2 border-t border-border p-4 text-xs text-muted-foreground">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            <div className="space-y-0.5">
              <div>系统每小时定时拉取一次，前台仅展示被识别为负面的日志，最多保留近 30 天</div>
              <div>默认展示近 1 小时数据，可在顶部时间范围切换；该页面以查看与导出为主</div>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AlertList;
