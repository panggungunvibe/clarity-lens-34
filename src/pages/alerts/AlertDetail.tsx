import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { negativeLogs } from "@/data/mockData";
import { SentimentBadge, SourceBadge } from "@/components/StatusBadges";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
    <div className="rounded-md border border-border bg-muted/30 p-4 text-sm leading-relaxed">{children}</div>
  </div>
);

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const log = negativeLogs.find((l) => l.id === id) ?? negativeLogs[0];

  return (
    <AppLayout
      breadcrumbs={[{ label: "告警日志", to: "/alerts" }, { label: "告警详情" }]}
      actions={
        <Button variant="outline" onClick={() => navigate("/alerts")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />返回列表
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl space-y-5">
        <Card className="p-6">
          <div className="space-y-3">
            <h1 className="text-xl font-semibold leading-snug">{log.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <SourceBadge source={log.source} />
              <span>发布时间：<span className="text-foreground tabular-nums">{log.publishedAt}</span></span>
              <span>作者：<span className="text-foreground">{log.author}</span></span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">原文链接：</span>
              <a
                href={log.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline break-all"
              >
                {log.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm border-b border-border pb-5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">命中策略</span>
              <span className="font-medium">{log.strategy}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">情感判断</span>
              <div className="flex items-center gap-2">
                <SentimentBadge sentiment={log.sentiment} />
                <span className="text-xs text-muted-foreground">系统自动识别</span>
              </div>
            </div>
          </div>

          <Section title="原文摘要">{log.summary}</Section>

          <Section title="命中关键词">
            <div className="flex flex-wrap gap-1.5">
              {log.hitKeywords.map((k) => (
                <Badge key={k} className="bg-primary-soft text-primary hover:bg-primary-soft">{k}</Badge>
              ))}
            </div>
          </Section>

        </Card>
      </div>
    </AppLayout>
  );
};

export default AlertDetail;
