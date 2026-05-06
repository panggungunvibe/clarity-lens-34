import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Search, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { topics, type TopicStatus } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadges";

const STATUS_OPTIONS: TopicStatus[] = ["待处理", "持续关注", "已处理", "误报"];

const AllTopicResults = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TopicStatus>("all");

  const list = useMemo(() => {
    const kw = search.trim();
    return topics.filter((t) => {
      const ms = !kw || t.name.includes(kw);
      const mst = statusFilter === "all" || t.status === statusFilter;
      return ms && mst;
    });
  }, [search, statusFilter]);

  const hasFilter = search.trim() !== "" || statusFilter !== "all";
  const reset = () => { setSearch(""); setStatusFilter("all"); };

  return (
    <AppLayout breadcrumbs={[{ label: "数据看板", to: "/dashboard" }, { label: "全部主题处理结果" }]}>
      <Card>
        <div className="flex flex-col gap-2 border-b border-border p-3 md:flex-row md:flex-wrap md:items-center md:gap-3 md:p-4">
          <div className="relative md:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索主题名称" className="h-9 pl-8" />
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | TopicStatus)}>
              <SelectTrigger className="h-9 flex-1 md:w-32 md:flex-none"><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {hasFilter && (
              <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={reset}>
                <X className="mr-1 h-3.5 w-3.5" />重置
              </Button>
            )}
            <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
              共 <span className="font-semibold text-foreground tabular-nums">{list.length}</span>
            </div>
          </div>
        </div>

        {/* 桌面 */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16">序号</TableHead>
                <TableHead>主题名称</TableHead>
                <TableHead className="w-28 text-right">负面日志数</TableHead>
                <TableHead className="w-32">当前状态</TableHead>
                <TableHead className="w-32">最近处理时间</TableHead>
                <TableHead>处理备注摘要</TableHead>
                <TableHead className="w-24 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</TableCell>
                  <TableCell><Link to={`/dashboard/topics/${t.id}`} className="font-medium hover:text-primary">{t.name}</Link></TableCell>
                  <TableCell className="text-right tabular-nums">{t.count.toLocaleString()}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {t.status === "待处理" ? "-" : t.timeRange.split("-")[1] ?? "-"}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-muted-foreground">{t.note ?? "-"}</TableCell>
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

        {/* 移动 */}
        <div className="divide-y divide-border md:hidden">
          {list.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">没有符合条件的主题</div>}
          {list.map((t, i) => (
            <div key={t.id} className="space-y-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <Link to={`/dashboard/topics/${t.id}`} className="flex-1 text-sm font-semibold leading-snug hover:text-primary">
                  <span className="mr-1.5 text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {t.name}
                </Link>
                <StatusBadge status={t.status} />
              </div>
              {t.note && <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{t.note}</p>}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="tabular-nums">{t.count.toLocaleString()} 条 · {t.status === "待处理" ? "-" : t.timeRange.split("-")[1] ?? "-"}</span>
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

export default AllTopicResults;
