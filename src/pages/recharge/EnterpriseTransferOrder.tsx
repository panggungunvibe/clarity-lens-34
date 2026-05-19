import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { getOrder, payeeInfo, upsertOrder, type RechargeOrder } from "@/data/rechargeMock";

const EnterpriseTransferOrder = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<RechargeOrder | undefined>(() => getOrder(id));

  useEffect(() => { setOrder(getOrder(id)); }, [id]);

  if (!order) {
    return (
      <AppLayout breadcrumbs={[{ label: "充值中心", to: "/recharge/buy" }, { label: "企业汇款" }]}>
        <Card className="p-8 text-center text-sm text-muted-foreground">订单不存在</Card>
      </AppLayout>
    );
  }

  const copy = () => {
    const text = [
      `名称：${payeeInfo.company}`,
      `纳税人识别号：${payeeInfo.taxId}`,
      `地址：${payeeInfo.address}`,
      `电话：${payeeInfo.phone}`,
      `开户行：${payeeInfo.bank}`,
      `账号：${payeeInfo.bankAccount}`,
      `汇款金额：¥${order.amount.toLocaleString()}`,
      `汇款备注：${order.id}`,
    ].join("\n");
    navigator.clipboard.writeText(text).then(
      () => toast.success("收款信息已复制"),
      () => toast.error("复制失败"),
    );
  };

  const handleDone = () => {
    upsertOrder({ ...order, status: "待人工确认" });
    setOrder(getOrder(id));
    toast.success("已提交汇款完成申请，请等待客服确认到账");
  };

  const handleCancel = () => {
    upsertOrder({ ...order, status: "已取消" });
    toast.message("订单已取消");
    navigate("/recharge/buy");
  };

  return (
    <AppLayout breadcrumbs={[{ label: "充值中心", to: "/recharge/buy" }, { label: "企业汇款" }]}>
      <Card className="mx-auto max-w-3xl p-4 md:p-6">
        <div className="grid grid-cols-2 gap-y-4">
          <Info label="已选套餐" value={order.packageName} />
          <Info label="购买条数" value={`${order.quota.toLocaleString()} 条`} />
          <Info label="支付金额" value={`¥${order.amount.toLocaleString()}`} highlight />
          <Info label="支付方式" value="企业银行汇款" />
          <Info label="订单编号" value={order.id} mono full />
          <Info label="创建时间" value={order.createdAt} />
          <div>
            <div className="text-xs text-muted-foreground">当前状态</div>
            <Badge variant="outline" className="mt-1 font-medium">{order.status}</Badge>
          </div>
        </div>

        <h3 className="mt-8 mb-3 text-sm font-semibold">收款账户信息</h3>
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <div className="grid grid-cols-1 gap-y-3 text-sm">
            <Row k="名称" v={payeeInfo.company} />
            <Row k="纳税人识别号" v={payeeInfo.taxId} mono />
            <Row k="地址" v={payeeInfo.address} />
            <Row k="电话" v={payeeInfo.phone} mono />
            <Row k="开户行" v={payeeInfo.bank} />
            <Row k="账号" v={payeeInfo.bankAccount} mono />
            <Row k="汇款金额" v={`¥${order.amount.toLocaleString()}`} highlight />
            <Row k="汇款备注" v={order.id} mono />
          </div>
        </div>

        <h3 className="mt-6 mb-2 text-sm font-semibold">操作说明</h3>
        <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground leading-relaxed">
          <li>请使用企业账户完成对公汇款</li>
          <li>汇款金额需与订单金额一致</li>
          <li>汇款时请备注订单编号，便于对账</li>
          <li>一般会在 24 小时内完成充值到账，如长时间未完成，可添加下方客服微信咨询</li>
        </ol>

        <h3 className="mt-6 mb-2 text-sm font-semibold">客服信息</h3>
        <div className="flex flex-col gap-4 rounded-md border border-border p-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="text-sm">
            <div className="text-xs text-muted-foreground">客服微信号</div>
            <div className="mt-1 font-mono font-semibold">{payeeInfo.serviceWechat}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">客服二维码</div>
            <div className="mt-1 flex h-32 w-32 items-center justify-center rounded border border-dashed border-border text-[10px] text-muted-foreground">
              二维码区域
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 md:flex md:flex-wrap md:gap-3">
          <Button variant="outline" onClick={copy} className="h-11 md:h-10"><Copy className="mr-2 h-4 w-4" />复制收款信息</Button>
          <Button onClick={handleDone} disabled={order.status !== "待汇款"} className="h-11 md:h-10">我已完成汇款</Button>
          <Button variant="ghost" onClick={handleCancel} disabled={order.status !== "待汇款"} className="h-11 md:h-10">取消订单</Button>
          <Button variant="link" onClick={() => navigate("/recharge/buy")} className="md:ml-auto">返回充值中心</Button>
        </div>
      </Card>
    </AppLayout>
  );
};

const Info = ({ label, value, highlight, mono, full }: { label: string; value: string; highlight?: boolean; mono?: boolean; full?: boolean }) => (
  <div className={full ? "col-span-2" : ""}>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={`mt-1 text-sm font-semibold tabular-nums break-all ${highlight ? "text-primary" : ""} ${mono ? "font-mono" : ""}`}>{value}</div>
  </div>
);

const Row = ({ k, v, highlight, mono }: { k: string; v: string; highlight?: boolean; mono?: boolean }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
    <span className="text-muted-foreground shrink-0">{k}</span>
    <span className={`font-semibold break-all sm:text-right ${highlight ? "text-primary" : ""} ${mono ? "font-mono" : ""}`}>{v}</span>
  </div>
);

export default EnterpriseTransferOrder;
