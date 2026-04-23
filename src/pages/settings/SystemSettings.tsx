import { useState } from "react";
import { Upload, Save, Mail, Building2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tabs = [
  { key: "platform", label: "平台信息", icon: Building2 },
  { key: "inbox", label: "站内信说明", icon: Mail },
];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-6">
    <h2 className="mb-4 border-b border-border pb-3 text-base font-semibold">{title}</h2>
    {children}
  </Card>
);

const SystemSettings = () => {
  const [active, setActive] = useState("platform");
  const [platformName, setPlatformName] = useState("舆情监控平台");

  return (
    <AppLayout
      breadcrumbs={[{ label: "系统设置" }]}
      actions={
        <Button onClick={() => toast.success("设置已保存")}>
          <Save className="mr-1.5 h-4 w-4" />保存全部设置
        </Button>
      }
    >
      <div className="grid grid-cols-[220px_1fr] gap-6">
        {/* 设置菜单 */}
        <Card className="h-fit p-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
                active === t.key
                  ? "bg-primary-soft font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </Card>

        <div className="space-y-5">
          {active === "platform" && (
            <Section title="1. 平台信息">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>平台名称</Label>
                  <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="max-w-md" />
                </div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
                      Logo
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-1.5 h-4 w-4" />上传文件
                    </Button>
                    <span className="text-xs text-muted-foreground">建议尺寸 200×200，PNG / SVG</span>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {active === "inbox" && (
            <Section title="2. 站内信说明">
              <div className="space-y-4 text-sm leading-relaxed">
                <p>当前仅支持站内信通知。</p>
                <p>每次定时拉取完成后，系统会按时间窗口生成一条摘要通知，用户可在右上角铃铛中查看并点击进入对应的智能分析页。</p>
                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <div className="mb-2 text-xs font-medium text-muted-foreground">站内信示例</div>
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold">【负面舆情摘要】</div>
                    <div>10:00-11:00 某品牌监测策略共识别 96 条负面日志，聚类出 24 个主题。</div>
                    <div className="text-muted-foreground">主要主题：续航争议 / 价格讨论 / 客服投诉。</div>
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SystemSettings;
