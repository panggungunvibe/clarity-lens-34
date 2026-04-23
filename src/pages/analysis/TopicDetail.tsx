import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { topics, negativeLogs, type TopicStatus } from "@/data/mockData";
import { StatusBadge, SourceBadge } from "@/components/StatusBadges";
import TablePagination from "@/components/TablePagination";
import WordCloud from "@/components/WordCloud";
import { toast } from "sonner";

const STATUS_OPTIONS: TopicStatus[] = ["待处理", "持续关注", "已处理", "误报"];

// 根据主题信息生成挂载的负面日志（数量与 topic.count 一致），从 negativeLogs 池中循环取样
const buildTopicLogs = (topicId: string, count: number, sources: string[], keywords: string[]) => {
  const pool = negativeLogs;
  const logs: { logId: string; title: string; source: string; time: string }[] = [];
  // 用主题 id 作为种子，保证每个主题相对稳定
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

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const topic = topics.find((t) => t.id === id) ?? topics[0];

  const [status, setStatus] = useState<TopicStatus>(topic.status);
  const [note, setNote] = useState(topic.note ?? "");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const allLogs = useMemo(
    () => buildTopicLogs(topic.id, topic.count, topic.sources, topic.keywords),
    [topic.id, topic.count, topic.sources, topic.keywords]
  );

  const pagedLogs = useMemo(
    () => allLogs.slice((page - 1) * pageSize, page * pageSize),
    [allLogs, page, pageSize]
  );

  // 词频云数据：基于主题关键词，结合主题热度生成稳定但有差异的词频
  const wordCloudData = useMemo(() => {
    const seed = topic.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    // 扩展一些通用衍生词，让词云更丰富
    const extras = ["讨论", "投诉", "关注", "争议", "反馈", "吐槽", "评测", "对比", "维权", "回应"];
    const base = [...topic.keywords, ...extras.slice(0, Math.max(4, 10 - topic.keywords.length))];
    return base.map((text, i) => {
      // 越靠前的关键词权重越高
      const positionFactor = 1 - i / (base.length + 2);
      const noise = ((seed + i * 31) % 17) / 50; // 0..0.32
      const weight = Math.max(8, Math.round(topic.count * (0.05 + positionFactor * 0.35 + noise) / 10));
      return { text, weight };
    });
  }, [topic]);

  return (
    <AppLayout
      breadcrumbs={[{ label: "智能分析", to: "/analysis" }, { label: "主题详情" }]}
      actions={
        <Button variant="outline" onClick={() => navigate("/analysis")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />返回列表
        </Button>
      }
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">主题名称</div>
              <h1 className="mt-1 text-xl font-semibold">{topic.name}</h1>
            </div>
            <StatusBadge status={status} />
          </div>
        </Card>

        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">挂载负面日志</div>
            <div className="mt-1 text-2xl font-semibold text-destructive tabular-nums">{topic.count.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">时间范围</div>
            <div className="mt-1 text-base font-semibold tabular-nums">{topic.timeRange}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">主要来源</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {topic.sources.map((s) => <SourceBadge key={s} source={s} />)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground">当前处理状态</div>
            <Select value={status} onValueChange={(v) => { setStatus(v as TopicStatus); toast.success("状态已更新"); }}>
              <SelectTrigger className="mt-2 h-8">
                <SelectValue><StatusBadge status={status} /></SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Card>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold">主题摘要</h3>
            <p className="rounded-md bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
              {topic.summary}
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">词频云分析</h3>
              <span className="text-[11px] text-muted-foreground">基于聚类内日志的关键词出现频次统计</span>
            </div>
            <WordCloud words={wordCloudData} />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                挂载日志列表
                <span className="ml-2 text-xs font-normal text-muted-foreground tabular-nums">
                  共 {topic.count.toLocaleString()} 条
                </span>
              </h3>
              <span className="text-xs text-muted-foreground">点击日志可跳转至告警日志详情</span>
            </div>
            <div className="divide-y divide-border rounded-md border border-border">
              {pagedLogs.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">暂无明细日志</div>
              )}
              {pagedLogs.map((log, i) => {
                const globalIdx = (page - 1) * pageSize + i + 1;
                const content = (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-muted-foreground tabular-nums w-10 shrink-0">{String(globalIdx).padStart(4, "0")}</span>
                      <span className="font-medium truncate group-hover:text-primary">{log.title}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <SourceBadge source={log.source} />
                      <span className="text-xs text-muted-foreground tabular-nums">{log.time}</span>
                      {log.logId && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />}
                    </div>
                  </>
                );
                return log.logId ? (
                  <Link
                    key={i}
                    to={`/alerts/${log.logId}`}
                    className="group flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-muted/40"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={i} className="group flex items-center justify-between px-4 py-3 text-sm">
                    {content}
                  </div>
                );
              })}
            </div>
            {topic.count > 0 && (
              <div className="mt-3">
                <TablePagination
                  total={topic.count}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
                />
              </div>
            )}
          </div>

          <div>
            <Label className="mb-2 block text-sm font-semibold">处理备注</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="如：已同步法务，待确认是否需要统一口径"
              rows={3}
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={() => toast.success("备注已保存")}>
                <Save className="mr-1.5 h-4 w-4" />保存修改
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TopicDetail;
