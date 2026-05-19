import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOrder, methodLabel, payeeInfo, type OrderStatus } from "@/data/rechargeMock";

const STATUS_STYLE: Record<OrderStatus, string> = {
  待支付: "bg-warning-soft text-warning border-warning/20",
  待汇款: "bg-warning-soft text-warning border-warning/20",
  待人工确认: "bg-info-soft text-info border-info/20",
  已完成: "bg-success-soft text-success border-success/20",
  已取消: "bg-muted text-muted-foreground border-border",
  已失败: "bg-destructive-soft text-destructive border-destructive/20",
  已过期: "bg-muted text-muted-foreground border-border",
};

const OrderDetail = () => {
  const { id = "" } = useParams();
  const order = getOrder(id);

  if (!order) {
    return (
      <AppLayout breadcrumbs={[{ label: "充值中心", to: "/recharge/buy" }, { label: "订单详情" }]}>
        <Card className="p-8 text-center text-sm text-muted-foreground">订单不存在</Card>
      </AppLayout>
    );
  }

  const statusText: Record<OrderStatus, string> = {
    待支付: "该订单等待用户完成扫码支付。",
    待汇款: "该订单等待用户完成对公汇款。",
    待人工确认: "用户已提交汇款完成申请，等待客服确认到账。",
    已完成: "该订单已支付成功，对应条数已充值到账。",
    已取消: "该订单已取消。",
    已失败: "该订单支付失败，可重新发起支付。",
    已过期: "该订单已过期，可重新发起支付。",
  };

  return (
    <AppLayout breadcrumbs={[{ label: "充值中心", to: "/recharge/buy" }, { label: "订单详情" }]}>
      <Card className="mx-auto max-w-3xl p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">订单详情</h2>
          <Badge variant="outline" className={cn("font-medium", STATUS_STYLE[order.status])}>{order.status}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-y-4">
          <Info label="订单编号" value={order.id} mono full />
          <Info label="套餐名称" value={order.packageName} />
          <Info label="购买条数" value={`${order.quota.toLocaleString()} 条`} />
          <Info label="支付金额" value={`¥${order.amount.toLocaleString()}`} highlight />
          <Info label="充值类型" value={methodLabel[order.method]} />
          <Info label="创建时间" value={order.createdAt} />
          <Info label="完成时间" value={order.completedAt ?? "-"} />
        </div>

        <h3 className="mt-6 mb-2 text-sm font-semibold">订单说明</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{statusText[order.status]}</p>

        {order.method === "bank" && (
          <>
            <h3 className="mt-6 mb-2 text-sm font-semibold">汇款信息</h3>
            <div className="rounded-md border border-border bg-muted/30 p-4 text-sm space-y-2">
              <Row k="名称" v={payeeInfo.company} />
              <Row k="纳税人识别号" v={payeeInfo.taxId} mono />
              <Row k="地址" v={payeeInfo.address} />
              <Row k="电话" v={payeeInfo.phone} mono />
              <Row k="开户行" v={payeeInfo.bank} />
              <Row k="账号" v={payeeInfo.bankAccount} mono />
              <Row k="汇款备注" v={order.id} mono />
              <Row k="客服微信号" v={payeeInfo.serviceWechat} mono />
            </div>
          </>
        )}

        <div className="mt-6 grid grid-cols-1 gap-2 md:flex md:gap-3">
          {(order.status === "已取消" || order.status === "已失败" || order.status === "已过期") && (
            <Link to={`/recharge/pay/${order.id}`}>
              <Button className="w-full md:w-auto h-11 md:h-10">重新支付</Button>
            </Link>
          )}
          {order.status === "待支付" && (
            <Link to={`/recharge/pay/${order.id}`}><Button className="w-full md:w-auto h-11 md:h-10">继续支付</Button></Link>
          )}
          {order.status === "待汇款" && (
            <Link to={`/recharge/bank/${order.id}`}><Button className="w-full md:w-auto h-11 md:h-10">继续汇款</Button></Link>
          )}
          <Link to="/recharge/buy" className="md:ml-auto">
            <Button variant="link" className="w-full md:w-auto">返回充值中心</Button>
          </Link>
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

const Row = ({ k, v, mono }: { k: string; v: string; mono?: boolean }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
    <span className="text-muted-foreground shrink-0">{k}</span>
    <span className={`font-semibold break-all sm:text-right ${mono ? "font-mono" : ""}`}>{v}</span>
  </div>
);

export default OrderDetail;
