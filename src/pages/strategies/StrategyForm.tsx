import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Info } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TagsInput } from "@/components/TagsInput";
import { strategies } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  mode: "create" | "edit";
}

const MAX_CHARS = 500;

const StrategyForm = ({ mode }: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const existing = mode === "edit" ? strategies.find((s) => s.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [keywords, setKeywords] = useState<string[]>(existing?.keywords ?? []);
  const [excludeKeywords] = useState<string[]>(existing?.excludeKeywords ?? []);
  const [notifyInbox, setNotifyInbox] = useState(existing?.notifyInbox ?? true);

  const totalChars = keywords.join("").length;
  const overLimit = totalChars > MAX_CHARS;

  const handleSave = () => {
    if (!name.trim()) return toast.error("请输入策略名称");
    if (keywords.length === 0) return toast.error("请至少输入一个关键词");
    if (overLimit) return toast.error("关键词总字数已超过 500 字上限");

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const updatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    if (mode === "create") {
      const newId = String(Date.now());
      strategies.unshift({
        id: newId,
        name: name.trim(),
        description: description.trim(),
        keywords,
        excludeKeywords,
        enabled: false,
        updatedAt,
        notifyInbox,
      });
      toast.success("策略创建成功");
    } else if (existing) {
      const idx = strategies.findIndex((s) => s.id === existing.id);
      if (idx >= 0) {
        strategies[idx] = {
          ...strategies[idx],
          name: name.trim(),
          description: description.trim(),
          keywords,
          excludeKeywords,
          notifyInbox,
          updatedAt,
        };
      }
      toast.success("策略已保存");
    }
    navigate("/strategies");
  };

  const title = mode === "create" ? "新建策略" : "编辑策略";

  return (
    <AppLayout
      breadcrumbs={[{ label: "策略配置", to: "/strategies" }, { label: title }]}
      actions={
        <>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>取消</Button>
          <Button size="sm" onClick={handleSave}>保存</Button>
        </>
      }
    >
      <div className="mx-auto max-w-4xl space-y-4 md:space-y-5">
        {/* 基础信息 */}
        <Card className="p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3 md:mb-5">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary-soft text-xs font-semibold text-primary">1</span>
            <h2 className="text-base font-semibold">基础信息</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>策略名称 <span className="text-destructive">*</span></Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：某品牌监测策略" />
            </div>
            <div className="space-y-2">
              <Label>策略描述</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简要说明该策略要做什么"
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* 检测规则 */}
        <Card className="p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3 md:mb-5">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary-soft text-xs font-semibold text-primary">2</span>
            <h2 className="text-base font-semibold">检测规则</h2>
          </div>

          <div className="mb-4 flex items-start gap-2 rounded-md bg-info-soft px-3 py-2.5 text-xs text-info md:mb-5">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>请在下方输入需要检测的关键词，按回车生成标签；当输入框为空时按退格可删除最近一个关键词。关键词总字数上限为 500 字。</span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-sm">想检测的关键词 <span className="text-destructive">*</span></Label>
              <span className="text-xs text-muted-foreground">已添加 {keywords.length} 个</span>
            </div>
            <TagsInput
              value={keywords}
              onChange={setKeywords}
              maxTotalChars={MAX_CHARS}
              placeholder="输入关键词后按回车"
              className="min-h-[180px] items-start md:min-h-[220px]"
            />
          </div>

          <div className="mt-3 flex items-center justify-end text-xs text-muted-foreground">
            关键词总字数：
            <span className={`ml-1 font-semibold tabular-nums ${overLimit ? "text-destructive" : "text-foreground"}`}>
              {totalChars}
            </span>
            <span className="mx-1">/</span>
            <span>{MAX_CHARS}</span>
          </div>
        </Card>

        {/* 通知方式 */}
        <Card className="p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3 md:mb-5">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary-soft text-xs font-semibold text-primary">3</span>
            <h2 className="text-base font-semibold">通知方式</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="inbox" checked={notifyInbox} onCheckedChange={(v) => setNotifyInbox(!!v)} />
              <Label htmlFor="inbox" className="cursor-pointer">站内信</Label>
            </div>
            <ul className="space-y-1 pl-6 text-xs leading-relaxed text-muted-foreground">
              <li>· 每次定时拉取完成后，系统会在右上角铃铛生成一条窗口级摘要通知</li>
              <li>· 当前版本不做通知对象配置，统一账号登录后查看站内信</li>
            </ul>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StrategyForm;
