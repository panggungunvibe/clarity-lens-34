import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Search, X, SlidersHorizontal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { topics, type TopicStatus } from "@/data/mockData";
import { StatusBadge, SourceBadge } from "@/components/StatusBadges";

const STATUS_OPTIONS: TopicStatus[] = ["待处理", "持续关注", "已处理", "误报"];

const AllNegativeTopics = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TopicStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    topics.forEach((t) => t.sources.forEach((s) => set.add(s)));
    return Array.from(set);
  }, []);

  const list = useMemo(() => {
    const kw = search.trim();
    return topics.filter((t) => {
      const ms = !kw || t.name.includes(kw) || t.summary.includes(kw);
      const mst = statusFilter === "all" || t.status === statusFilter;
      const msr = sourceFilter === "all" || t.sources.includes(sourceFilter);
      return ms && mst && msr;
    });
  }, [search, statusFilter, sourceFilter]);

  const hasFilter = search.trim() !== "" || statusFilter !== "all" || sourceFilter !== "all";
  const activeCount = (statusFilter !== "all" ? 1 : 0) + (sourceFilter !== "all" ? 1 : 0);
  const reset = () => { setSearch(""); setStatusFilter("all"); setSourceFilter("all"); };

  const FiltersBody = (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">处理状态</label>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | TopicStatus)}>
          <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">主要来源</label>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部来源</SelectItem>
            {sourceOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={[{ label: "数据看板", to: "/dashboard" }, { label: "全部负面主题" }]}>
      <Card>
        <div className="flex flex-col gap-2 border-b border-border p-3 md:flex-row md:flex-wrap md:items-center md:gap-3 md:p-4">
          <div className="relative md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索主题 / 摘要" className="h-9 pl-8" />
          </div>

          <div className="hidden md:flex md:flex-wrap md:items-center md:gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | TopicStatus)}>
              <SelectTrigger className="h-9 w-32"><SelectValue placeholder="处理状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-9 w-32"><SelectValue placeholder="主要来源" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                {sourceOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilter && (
              <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={reset}>
                <X className="mr-1 h-3.5 w-3.5" />重置
              </Button>
            )}
            <div className="ml-auto text-xs text-muted-foreground">
              共 <span className="font-semibold text-foreground tabular-nums">{list.length}</span> 个主题
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 flex-1 justify-center">
                  <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />筛选
                  {activeCount > 0 && (
                    <span className="ml-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {activeCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-xl">
                <SheetHeader className="text-left"><SheetTitle>筛选</SheetTitle></SheetHeader>
                <div className="py-4">{FiltersBody}</div>
                <SheetFooter className="flex-row gap-2 sm:justify-between">
                  <Button variant="outline" className="flex-1" onClick={reset}>重置</Button>
                  <Button className="flex-1" onClick={() => setFilterOpen(false)}>应用</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <span className="text-xs text-muted-foreground">
              共 <span className="font-semibold text-foreground tabular-nums">{list.length}</span>
            </span>
          </div>
        </div>

        {/* 桌面表格 */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16">序号</TableHead>
                <TableHead>主题名称</TableHead>
                <TableHead className="w-28 text-right">负面日志数</TableHead>
                <TableHead className="w-32">时间范围</TableHead>
                <TableHead className="w-56">主要来源</TableHead>
                <TableHead className="w-32">处理状态</TableHead>
                <TableHead className="w-24 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</TableCell>
                  <TableCell><Link to={`/dashboard/topics/${t.id}`} className="font-medium hover:text-primary">{t.name}</Link></TableCell>
                  <TableCell className="text-right tabular-nums">{t.count.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{t.timeRange}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{t.sources.map((s) => <SourceBadge key={s} source={s} />)}</div></TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
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
          {list.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">没有符合条件的主题</div>}
          {list.map((t) => (
            <div key={t.id} className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/dashboard/topics/${t.id}`} className="flex-1 text-sm font-semibold leading-snug hover:text-primary">{t.name}</Link>
                <span className="inline-flex h-6 shrink-0 min-w-[2.5rem] items-center justify-center rounded-md bg-destructive-soft px-2 text-xs font-semibold tabular-nums text-destructive">
                  {t.count.toLocaleString()}
                </span>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t.summary}</p>
              <div className="flex flex-wrap gap-1">{t.sources.map((s) => <SourceBadge key={s} source={s} />)}</div>
              <div className="flex items-center justify-between pt-1">
                <StatusBadge status={t.status} />
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-primary">
                  <Link to={`/dashboard/topics/${t.id}`}><Eye className="mr-1 h-3 w-3" />详情</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
};

export default AllNegativeTopics;
