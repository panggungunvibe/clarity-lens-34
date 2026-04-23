import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { strategies } from "@/data/mockData";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-1 border-b border-border py-3 last:border-0 sm:grid-cols-[120px_1fr] sm:items-start sm:gap-4">
    <span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
    <div className="text-sm">{children}</div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-4 md:p-6">
    <h2 className="mb-2 border-b border-border pb-3 text-base font-semibold">{title}</h2>
    {children}
  </Card>
);

const StrategyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const s = strategies.find((x) => x.id === id);

  if (!s) {
    return (
      <AppLayout breadcrumbs={[{ label: "策略配置", to: "/strategies" }, { label: "策略详情" }]}>
        <Card className="p-12 text-center text-muted-foreground">策略不存在</Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={[{ label: "策略配置", to: "/strategies" }, { label: "策略详情" }]}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => navigate("/strategies")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />返回
          </Button>
          <Button asChild size="sm">
            <Link to={`/strategies/${s.id}/edit`}>
              <Pencil className="mr-1.5 h-4 w-4" />编辑
            </Link>
          </Button>
        </>
      }
    >
      <div className="mx-auto max-w-4xl space-y-4 md:space-y-5">
        <Section title="基础信息">
          <Field label="策略名称"><span className="font-medium">{s.name}</span></Field>
          <Field label="策略描述">{s.description}</Field>
          <Field label="启用状态">
            {s.enabled ? (
              <Badge className="bg-success-soft text-success hover:bg-success-soft">已启用</Badge>
            ) : (
              <Badge variant="secondary">已停用</Badge>
            )}
          </Field>
          <Field label="更新时间"><span className="tabular-nums">{s.updatedAt}</span></Field>
        </Section>

        <Section title="检测规则">
          <Field label="想检测哪些">
            <div className="flex flex-wrap gap-1.5">
              {s.keywords.map((k) => (
                <Badge key={k} variant="secondary" className="bg-primary-soft text-primary">{k}</Badge>
              ))}
            </div>
          </Field>
          <Field label="关键词总字数">
            <span className="tabular-nums font-medium">{s.keywords.join("").length}</span>
            <span className="text-muted-foreground"> / 500</span>
          </Field>
        </Section>

        <Section title="通知方式">
          <div className="py-1">
            <Badge variant="outline" className="border-primary/30 bg-primary-soft text-primary">站内信</Badge>
          </div>
        </Section>
      </div>
    </AppLayout>
  );
};

export default StrategyDetail;
