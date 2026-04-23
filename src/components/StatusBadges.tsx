import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TopicStatus } from "@/data/mockData";

const statusStyle: Record<TopicStatus, string> = {
  待处理: "bg-warning-soft text-warning border-warning/20",
  持续关注: "bg-info-soft text-info border-info/20",
  已处理: "bg-success-soft text-success border-success/20",
  误报: "bg-muted text-muted-foreground border-border",
};

export const StatusBadge = ({ status }: { status: TopicStatus }) => (
  <Badge variant="outline" className={cn("font-medium", statusStyle[status])}>
    {status}
  </Badge>
);

const sentimentStyle: Record<string, string> = {
  轻度负面: "border-warning/30 bg-warning-soft text-warning",
  中度负面: "border-destructive/30 bg-destructive-soft text-destructive",
  重度负面: "border-destructive bg-destructive text-destructive-foreground",
};

export const SentimentBadge = ({ sentiment }: { sentiment: string }) => (
  <Badge
    variant="outline"
    className={cn(
      "font-medium",
      sentimentStyle[sentiment] ?? "border-destructive/30 bg-destructive-soft text-destructive",
    )}
  >
    {sentiment}
  </Badge>
);

export const SourceBadge = ({ source }: { source: string }) => (
  <Badge variant="secondary" className="whitespace-nowrap font-normal text-muted-foreground">
    {source}
  </Badge>
);
