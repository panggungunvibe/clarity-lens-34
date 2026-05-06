import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Save, ArrowUpRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { topics, negativeLogs, type TopicStatus } from "@/data/mockData";
import { SourceBadge, StatusBadge } from "@/components/StatusBadges";
import { toast } from "sonner";

const STATUS_OPTIONS: TopicStatus[] = ["待处理", "持续关注", "已处理", "误报"];

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
      title: `${log.title.split("(")[0].split("（")[0]}（${kw} · #${i + 1}）`,
      source: src,
      time: log.publishedAt.slice(11),
    });
  }
  return logs;
};

const DashboardTopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const topic = topics.find((t) => t.id === id) ?? topics[0];

  const [status, setStatus] = useState<TopicStatus>(topic.status);
  const [note, setNote] = useState(topic.note ?? "");

  const previewLogs = useMemo(
    () => buildTopicLogs(topic.id, Math.min(topic.count, 4), topic.sources, topic.keywords),
    [topic]
  );

  return (
    <AppLayout
      breadcrumbs={[{ label: "数据看板", to: "/dashboard" }, { label: "主题详情" }]}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />返回
        </Button>
      }
    >
      <div className="mx-auto max-w-5xl space-y-4 md:space-y-5">
        <Card className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 md:gap-x-8 md:gap-y-3">
            <Field label="主题名称" value={<span className="text-base font-semibold leading-snug">{topic.name}</span>} />
            <Field label="时间范围" value={<span className="tabular-nums">{topic.timeRange}</span>} />
            <Field label="主要来源" value={<div className="flex flex-wrap gap-1">{topic.sources.map((s) => <SourceBadge key={s} source={s} />)}</div>} />
            <Field
              label="处理状态"
              value={
                <Select value={status} onValueChange={(v) => { setStatus(v as TopicStatus); toast.success("状态已更新"); }}>
                  <SelectTrigger className="h-8 w-40"><SelectValue><StatusBadge status={status} /></SelectValue></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              }
            />
          </div>
        </Card>

        <Card className="space-y-5 p-4 md:space-y-6 md:p-6">
          <div>
            <h3 className="mb-2 text-sm font-semibold md:mb-3">主题摘要</h3>
            <p className="rounded-md bg-muted/40 p-3 text-sm leading-relaxed text-foreground md:p-4">{topic.summary}</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold md:mb-3">主题核心指标</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
              <Card className="p-3 md:p-4">
                <div className="text-xs text-muted-foreground">挂载负面日志数</div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-destructive md:text-2xl">{topic.count.toLocaleString()}</div>
              </Card>
              <Card className="p-3 md:p-4">
                <div className="text-xs text-muted-foreground">首次出现时间</div>
                <div className="mt-1 text-base font-semibold tabular-nums">{topic.timeRange.split("-")[0]}</div>
              </Card>
              <Card className="p-3 md:p-4">
                <div className="text-xs text-muted-foreground">代表性关键词</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {topic.keywords.slice(0, 5).map((k) => <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>)}
                </div>
              </Card>
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-baseline gap-x-2 md:mb-3">
              <h3 className="text-sm font-semibold">挂载日志列表</h3>
              <span className="text-xs font-normal text-muted-foreground">前 4 条预览，共 {topic.count.toLocaleString()} 条</span>
            </div>
            <div className="divide-y divide-border rounded-md border border-border">
              {previewLogs.map((log, i) => (
                <Link
                  key={i}
                  to={`/alerts/${log.logId}`}
                  className="group block px-3 py-2.5 text-sm transition-colors hover:bg-muted/40 md:px-4 md:py-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-7 shrink-0 text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0 flex-1 break-words font-medium leading-snug group-hover:text-primary">{log.title}</span>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 pl-9">
                    <SourceBadge source={log.source} />
                    <span className="text-xs text-muted-foreground tabular-nums">{log.time}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <Link to={`/dashboard/topics/${topic.id}/logs`}>当前主题全部挂载日志<ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <Link to="/alerts">当前窗口全部负面日志<ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-semibold">处理备注</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="如：已同步法务，待确认是否需要统一口径" rows={3} />
            <div className="mt-3 flex justify-end">
              <Button onClick={() => toast.success("备注已保存")} className="w-full sm:w-auto">
                <Save className="mr-1.5 h-4 w-4" />保存修改
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <span className="w-20 shrink-0 text-xs text-muted-foreground md:w-24">{label}</span>
    <div className="min-w-0 flex-1">{value}</div>
  </div>
);

export default DashboardTopicDetail;
