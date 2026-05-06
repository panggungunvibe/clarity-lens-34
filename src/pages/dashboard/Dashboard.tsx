import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowUpRight, Eye, ChevronDown } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
} from "recharts";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, SourceBadge } from "@/components/StatusBadges";
import { topics, timeWindows } from "@/data/mockData";
import { cn } from "@/lib/utils";

const trendByWindow: Record<string, { time: string; count: number }[]> = {
  "1h": Array.from({ length: 12 }, (_, i) => ({
    time: `${String(10).padStart(2, "0")}:${String(i * 5).padStart(2, "0")}`,
    count: Math.round(40 + Math.sin(i / 2) * 25 + i * 3),
  })),
  "6h": Array.from({ length: 6 }, (_, i) => ({
    time: `${String(5 + i).padStart(2, "0")}:00`,
    count: Math.round(60 + Math.sin(i) * 30 + i * 6),
  })),
  "24h": Array.from({ length: 12 }, (_, i) => ({
    time: `${String(i * 2).padStart(2, "0")}:00`,
    count: Math.round(40 + Math.cos(i / 2) * 30 + i * 4),
  })),
  "7d": Array.from({ length: 7 }, (_, i) => ({
    time: `D${i + 1}`,
    count: Math.round(120 + Math.sin(i) * 40 + i * 10),
  })),
  "30d": Array.from({ length: 15 }, (_, i) => ({
    time: `D${i + 1}`,
    count: Math.round(180 + Math.cos(i / 3) * 60 + i * 6),
  })),
};

const Dashboard = () => {
  const [windowKey, setWindowKey] = useState("1h");
  const trendData = trendByWindow[windowKey];
  const windowScale: Record<string, number> = { "1h": 1, "6h": 4, "24h": 12, "7d": 60, "30d": 200 };
  const scale = windowScale[windowKey] ?? 1;
  const k = scale;

  const negativeCount = trendData.reduce((s, p) => s + p.count, 0);
  const newTopicCount = Math.max(3, Math.round(Math.min(topics.length, 24) * Math.sqrt(k)));
  const topShare = useMemo(() => {
    const sorted = [...topics].sort((a, b) => b.count - a.count);
    const total = sorted.reduce((s, t) => s + t.count, 0);
    const top5 = sorted.slice(0, 5).reduce((s, t) => s + t.count, 0);
    const base = total === 0 ? 0 : (top5 / total) * 100;
    const adjusted = base * (1 - Math.min(0.4, Math.log2(scale + 1) / 12));
    return Math.round(adjusted * 10) / 10;
  }, [scale]);

  const topTopics = useMemo(() => [...topics].sort((a, b) => b.count - a.count).slice(0, 5), []);

  const statusCount = useMemo(() => {
    const baseRatios: Record<string, number> = { 待处理: 0.42, 持续关注: 0.27, 已处理: 0.24, 误报: 0.07 };
    const total = Math.max(4, Math.round(newTopicCount * (1 + scale * 0.15)));
    const counts: Record<string, number> = {};
    let assigned = 0;
    const keys = Object.keys(baseRatios);
    keys.forEach((key, i) => {
      if (i === keys.length - 1) counts[key] = Math.max(0, total - assigned);
      else { counts[key] = Math.round(total * baseRatios[key]); assigned += counts[key]; }
    });
    return counts;
  }, [newTopicCount, scale]);

  const handledRate = useMemo(() => {
    const handled = statusCount["已处理"] + statusCount["误报"];
    const total = Object.values(statusCount).reduce((a, b) => a + b, 0);
    return total === 0 ? 0 : Math.round((handled / total) * 100);
  }, [statusCount]);

  const statusBars = [
    { name: "待处理", value: statusCount["待处理"], color: "hsl(var(--warning))" },
    { name: "持续关注", value: statusCount["持续关注"], color: "hsl(var(--info))" },
    { name: "已处理", value: statusCount["已处理"], color: "hsl(var(--success))" },
    { name: "误报", value: statusCount["误报"], color: "hsl(var(--muted-foreground))" },
  ];

  const handledExamples = useMemo(() => {
    const pool = topics.filter((t) => t.status !== "待处理");
    const take = Math.max(2, Math.min(pool.length, 3 + Math.floor(Math.log2(scale + 1))));
    const offset = (windowKey.length * 3) % pool.length;
    return Array.from({ length: take }, (_, i) => pool[(offset + i) % pool.length]);
  }, [scale, windowKey]);

  return (
    <AppLayout breadcrumbs={[{ label: "数据看板" }]}>
      <div className="space-y-4 md:space-y-5">
        {/* 时间筛选 */}
        <Card className="p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />时间范围
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {timeWindows.map((w) => (
                <button
                  key={w.key}
                  onClick={() => setWindowKey(w.key)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs transition-colors",
                    windowKey === w.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                  )}
                >{w.label}</button>
              ))}
            </div>
          </div>
        </Card>

        <Tabs defaultValue="risk" className="space-y-4 md:space-y-5">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="risk" className="flex-1 md:flex-none">风险新增</TabsTrigger>
            <TabsTrigger value="result" className="flex-1 md:flex-none">处理成果</TabsTrigger>
          </TabsList>

          {/* Tab1：风险新增 */}
          <TabsContent value="risk" className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              <MetricCard label="负面日志数" value={negativeCount.toLocaleString()} hint="当前范围内新增" tone="destructive" />
              <MetricCard label="新增负面主题数" value={String(newTopicCount)} hint="当前范围内新增" />
              <MetricCard className="col-span-2 md:col-span-1" label="Top 5 主题占比" value={`${topShare}%`} hint="Top 5 / 全部" />
            </div>

            <Card className="p-3 md:p-5">
              <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <h3 className="text-sm font-semibold">负面日志数趋势</h3>
                <span className="text-[11px] text-muted-foreground md:text-xs">按时间分桶统计</span>
              </div>
              <div className="h-52 w-full md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={36} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 2.5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-3 md:p-5">
              <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <h3 className="text-sm font-semibold">Top 5 负面主题</h3>
                <span className="text-[11px] text-muted-foreground md:text-xs">按日志数倒序</span>
              </div>
              <div className="h-56 w-full md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topTopics.map((t) => ({ name: t.name, count: t.count }))} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis type="category" dataKey="name" width={96} tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                    <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <div className="flex flex-col gap-2 border-b border-border p-3 md:flex-row md:items-center md:justify-between md:p-4">
                <h3 className="text-sm font-semibold">Top 新增主题明细</h3>
                <Button asChild variant="ghost" size="sm" className="h-8 self-start text-primary md:self-auto">
                  <Link to="/dashboard/negative-topics">
                    全部负面主题<ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              {/* 桌面表格 */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-16">序号</TableHead>
                      <TableHead>主题名称</TableHead>
                      <TableHead className="w-28 text-right">负面日志数</TableHead>
                      <TableHead className="w-56">主要来源</TableHead>
                      <TableHead className="w-32">首次出现时间</TableHead>
                      <TableHead className="w-24 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topTopics.map((t, i) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</TableCell>
                        <TableCell><Link to={`/dashboard/topics/${t.id}`} className="font-medium hover:text-primary">{t.name}</Link></TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-md bg-destructive-soft px-2 text-xs font-semibold tabular-nums text-destructive">
                            {t.count.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell><div className="flex flex-wrap gap-1">{t.sources.map((s) => <SourceBadge key={s} source={s} />)}</div></TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">{t.timeRange.split("-")[0]}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                            <Link to={`/dashboard/topics/${t.id}`}><Eye className="mr-1 h-3.5 w-3.5" />详情</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* 移动卡片 */}
              <div className="divide-y divide-border md:hidden">
                {topTopics.map((t, i) => (
                  <div key={t.id} className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/dashboard/topics/${t.id}`} className="flex-1 text-sm font-medium leading-snug hover:text-primary">
                        <span className="mr-1.5 text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                        {t.name}
                      </Link>
                      <span className="inline-flex h-6 shrink-0 min-w-[2.5rem] items-center justify-center rounded-md bg-destructive-soft px-2 text-xs font-semibold tabular-nums text-destructive">
                        {t.count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">{t.sources.map((s) => <SourceBadge key={s} source={s} />)}</div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="tabular-nums">{t.timeRange.split("-")[0]}</span>
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-primary">
                        <Link to={`/dashboard/topics/${t.id}`}><Eye className="mr-1 h-3 w-3" />详情</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Tab2：处理成果 */}
          <TabsContent value="result" className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <MetricCard label="已处理主题数" value={String(statusCount["已处理"])} hint="已处理" tone="success" />
              <MetricCard label="持续关注主题数" value={String(statusCount["持续关注"])} hint="持续跟踪" tone="info" />
              <MetricCard label="误报主题数" value={String(statusCount["误报"])} hint="判误报" />
              <MetricCard label="处理完成率" value={`${handledRate}%`} hint="已处理 / 全部" />
            </div>

            <Card className="p-3 md:p-5">
              <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <h3 className="text-sm font-semibold">主题处理结果分布</h3>
                <span className="text-[11px] text-muted-foreground md:text-xs">按当前范围状态统计</span>
              </div>

              <div className="flex h-7 w-full overflow-hidden rounded-md border border-border">
                {statusBars.map((s, i) => {
                  const total = statusBars.reduce((acc, x) => acc + x.value, 0);
                  const pct = total === 0 ? 0 : (s.value / total) * 100;
                  return (
                    <div key={i} title={`${s.name} ${s.value}`} style={{ width: `${pct}%`, background: s.color }}
                      className="flex items-center justify-center text-[11px] font-medium text-white">
                      {pct > 10 ? `${s.value}` : ""}
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {statusBars.map((s) => (
                  <span key={s.name} className="inline-flex items-center gap-1">
                    <span className="inline-block h-2 w-2 rounded-sm" style={{ background: s.color }} />
                    {s.name} {s.value}
                  </span>
                ))}
              </div>

              <Collapsible className="mt-4">
                <CollapsibleTrigger className="group inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  展开查看分项柱状图
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-3 h-56 w-full md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusBars} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis type="category" dataKey="name" width={64} tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {statusBars.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            <Card>
              <div className="flex flex-col gap-2 border-b border-border p-3 md:flex-row md:items-center md:justify-between md:p-4">
                <h3 className="text-sm font-semibold">已处理主题示例</h3>
                <Button asChild variant="ghost" size="sm" className="h-8 self-start text-primary md:self-auto">
                  <Link to="/dashboard/topic-results">
                    全部处理结果<ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              {/* 桌面表格 */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="w-16">序号</TableHead>
                      <TableHead>主题名称</TableHead>
                      <TableHead className="w-28 text-right">负面日志数</TableHead>
                      <TableHead className="w-32">当前状态</TableHead>
                      <TableHead className="w-32">最近处理时间</TableHead>
                      <TableHead className="w-24 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {handledExamples.map((t, i) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</TableCell>
                        <TableCell><Link to={`/dashboard/topics/${t.id}`} className="font-medium hover:text-primary">{t.name}</Link></TableCell>
                        <TableCell className="text-right tabular-nums">{t.count.toLocaleString()}</TableCell>
                        <TableCell><StatusBadge status={t.status} /></TableCell>
                        <TableCell className="text-muted-foreground tabular-nums">{t.timeRange.split("-")[1] ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                            <Link to={`/dashboard/topics/${t.id}`}><Eye className="mr-1 h-3.5 w-3.5" />详情</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* 移动卡片 */}
              <div className="divide-y divide-border md:hidden">
                {handledExamples.map((t, i) => (
                  <div key={t.id} className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/dashboard/topics/${t.id}`} className="flex-1 text-sm font-medium leading-snug hover:text-primary">
                        <span className="mr-1.5 text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                        {t.name}
                      </Link>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="tabular-nums">{t.count.toLocaleString()} 条 · {t.timeRange.split("-")[1] ?? "-"}</span>
                      <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-primary">
                        <Link to={`/dashboard/topics/${t.id}`}><Eye className="mr-1 h-3 w-3" />详情</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "destructive" | "warning" | "success" | "info";
  className?: string;
}

const MetricCard = ({ label, value, hint, tone = "default", className }: MetricCardProps) => {
  const toneClass = {
    default: "text-foreground",
    destructive: "text-destructive",
    warning: "text-warning",
    success: "text-success",
    info: "text-info",
  }[tone];
  return (
    <Card className={cn("p-3 md:p-5", className)}>
      <div className="text-[11px] text-muted-foreground md:text-xs">{label}</div>
      <div className={cn("mt-1 text-xl font-semibold tabular-nums md:mt-1.5 md:text-2xl", toneClass)}>{value}</div>
      {hint && <div className="mt-1 text-[10px] text-muted-foreground md:text-[11px]">{hint}</div>}
    </Card>
  );
};

export default Dashboard;
