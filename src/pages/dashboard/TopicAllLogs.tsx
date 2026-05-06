import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TablePagination from "@/components/TablePagination";
import { topics, negativeLogs } from "@/data/mockData";
import { SourceBadge } from "@/components/StatusBadges";

const buildTopicLogs = (topicId: string, count: number, sources: string[], keywords: string[]) => {
  const pool = negativeLogs;
  const logs: { logId: string; title: string; source: string; time: string }[] = [];
  const seed = topicId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = 0; i < count; i++) {
    const idx = (seed + i * 17) % pool.length;
    const log = pool[idx];
    const kw = keywords[i % keywords.length] ?? "";
    const src = sources[i % sources.length] ?? log.source;
    logs.push({
      logId: log.id,
      title: `${log.title.split("（")[0]}（${kw} · #${i + 1}）`,
      source: src,
      time: log.publishedAt.slice(11),
    });
  }
  return logs;
};

const TopicAllLogs = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const topic = topics.find((t) => t.id === id) ?? topics[0];
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const allLogs = useMemo(
    () => buildTopicLogs(topic.id, topic.count, topic.sources, topic.keywords),
    [topic]
  );
  const paged = useMemo(
    () => allLogs.slice((page - 1) * pageSize, page * pageSize),
    [allLogs, page, pageSize]
  );

  return (
    <AppLayout
      breadcrumbs={[
        { label: "数据看板", to: "/dashboard" },
        { label: "主题详情", to: `/dashboard/topics/${topic.id}` },
        { label: "主题挂载日志" },
      ]}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />返回
        </Button>
      }
    >
      <Card>
        <div className="border-b border-border p-3 md:p-4">
          <div className="text-sm">所属主题：<span className="font-semibold">{topic.name}</span></div>
          <div className="mt-1 text-xs text-muted-foreground tabular-nums">时间范围：{topic.timeRange} · 共 {topic.count.toLocaleString()} 条</div>
        </div>

        {/* 桌面 */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16">序号</TableHead>
                <TableHead>标题</TableHead>
                <TableHead className="w-24">来源</TableHead>
                <TableHead className="w-24">发布时间</TableHead>
                <TableHead className="w-32">原文链接</TableHead>
                <TableHead className="w-24 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((log, i) => {
                const idx = (page - 1) * pageSize + i + 1;
                return (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground tabular-nums">{String(idx).padStart(4, "0")}</TableCell>
                    <TableCell className="font-medium">{log.title}</TableCell>
                    <TableCell><SourceBadge source={log.source} /></TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{log.time}</TableCell>
                    <TableCell>
                      <a className="inline-flex items-center text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                        点击查看原文<ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                        <Link to={`/alerts/${log.logId}`}>告警详情</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* 移动卡片 */}
        <div className="divide-y divide-border md:hidden">
          {paged.map((log, i) => {
            const idx = (page - 1) * pageSize + i + 1;
            return (
              <div key={i} className="space-y-2 p-3">
                <div className="flex items-start gap-2">
                  <span className="w-9 shrink-0 text-xs text-muted-foreground tabular-nums">{String(idx).padStart(4, "0")}</span>
                  <span className="min-w-0 flex-1 break-words text-sm font-medium leading-snug">{log.title}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-11">
                  <SourceBadge source={log.source} />
                  <span className="text-[11px] text-muted-foreground tabular-nums">{log.time}</span>
                </div>
                <div className="flex items-center justify-between pl-11 pt-1">
                  <a className="inline-flex items-center text-xs text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>
                    查看原文<ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-primary">
                    <Link to={`/alerts/${log.logId}`}>告警详情</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border p-2 md:p-3">
          <TablePagination
            total={topic.count}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </div>
      </Card>
    </AppLayout>
  );
};

export default TopicAllLogs;
