import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Wallet, QrCode, Building2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createOrder, rechargePackages, type PaymentMethod } from "@/data/rechargeMock";
import { RechargeNav } from "./RechargeNav";

const Buy = () => {
  const navigate = useNavigate();
  const [selectedPkgId, setSelectedPkgId] = useState<string>("p2");
  const [method, setMethod] = useState<PaymentMethod>("wechat");

  const selectedPkg = rechargePackages.find((p) => p.id === selectedPkgId) ?? rechargePackages[0];

  const handleNext = () => {
    const order = createOrder(selectedPkg, method);
    toast.success(`订单已创建：${order.id}`);
    navigate(method === "bank" ? `/recharge/bank/${order.id}` : `/recharge/pay/${order.id}`);
  };

  return (
    <AppLayout breadcrumbs={[{ label: "充值中心", to: "/recharge/buy" }, { label: "购买充值" }]}>
      <RechargeNav />
      <div className="space-y-4 pb-24 md:pb-0">
        <Card className="p-4 md:p-5">
          <SectionTitle index={1} title="选择套餐" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {rechargePackages.map((p) => {
              const active = p.id === selectedPkgId;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedPkgId(p.id)}
                  className={cn(
                    "relative rounded-lg border bg-card p-3 md:p-4 text-left transition-all",
                    active
                      ? "border-primary ring-2 ring-primary/20 shadow-sm"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {active && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="mt-2 text-xl md:text-2xl font-bold tabular-nums">
                    {p.quota.toLocaleString()}
                    <span className="ml-1 text-xs md:text-sm font-normal text-muted-foreground">条</span>
                  </div>
                  <div className="mt-1 text-base md:text-lg font-semibold text-primary tabular-nums">¥{p.price.toLocaleString()}</div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 md:p-5">
          <SectionTitle index={2} title="选择支付方式" />
          <RadioGroup
            value={method}
            onValueChange={(v) => setMethod(v as PaymentMethod)}
            className="grid grid-cols-1 gap-3 md:grid-cols-3"
          >
            <MethodOption value="wechat" current={method} icon={<QrCode className="h-4 w-4" />} label="微信支付" desc="扫码支付，实时到账" />
            <MethodOption value="alipay" current={method} icon={<Wallet className="h-4 w-4" />} label="支付宝" desc="扫码支付，实时到账" />
            <MethodOption value="bank" current={method} icon={<Building2 className="h-4 w-4" />} label="企业银行汇款" desc="对公汇款，人工确认后到账" />
          </RadioGroup>

          {/* 桌面端汇总条 */}
          <div className="mt-6 hidden md:flex items-center justify-between rounded-md bg-muted/40 px-4 py-3">
            <div className="text-xs text-muted-foreground">
              已选：<span className="font-medium text-foreground">{selectedPkg.name}</span>
              <span className="mx-2">·</span>
              {selectedPkg.quota.toLocaleString()} 条
              <span className="mx-2">·</span>
              <span className="font-semibold text-primary">¥{selectedPkg.price.toLocaleString()}</span>
            </div>
            <Button onClick={handleNext} className="min-w-[120px]">下一步</Button>
          </div>
        </Card>

        <p className="text-xs text-muted-foreground">如需发票，请联系商务或客服处理。</p>
      </div>

      {/* 移动端底部固定操作条 */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-card px-3 py-3 shadow-lg md:hidden">
        <div className="flex-1 text-xs leading-snug">
          <div className="text-muted-foreground truncate">{selectedPkg.name} · {selectedPkg.quota.toLocaleString()} 条</div>
          <div className="text-base font-bold text-primary tabular-nums">¥{selectedPkg.price.toLocaleString()}</div>
        </div>
        <Button onClick={handleNext} className="h-11 min-w-[110px]">下一步</Button>
      </div>
    </AppLayout>
  );
};

const SectionTitle = ({ index, title }: { index: number; title: string }) => (
  <div className="mb-4 flex items-center gap-2">
    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{index}</span>
    <span className="text-sm font-semibold">{title}</span>
  </div>
);

const MethodOption = ({
  value, current, icon, label, desc,
}: { value: PaymentMethod; current: PaymentMethod; icon: React.ReactNode; label: string; desc: string }) => {
  const active = value === current;
  return (
    <Label
      htmlFor={`m-${value}`}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 md:p-4 transition-all",
        active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40",
      )}
    >
      <RadioGroupItem id={`m-${value}`} value={value} />
      <div className="flex flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{label}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
    </Label>
  );
};

export default Buy;
