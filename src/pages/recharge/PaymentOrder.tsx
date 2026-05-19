import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "lucide-react";
import { toast } from "sonner";
import {
  addRemaining,
  getOrder,
  upsertOrder,
  type RechargeOrder,
} from "@/data/rechargeMock";

const PaymentOrder = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<RechargeOrder | undefined>(() => getOrder(id));
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    setOrder(getOrder(id));
  }, [id]);

  if (!order) {
    return (
      <AppLayout breadcrumbs={[{ label: "充值中心", to: "/recharge/buy" }, { label: "支付订单" }]}>
        <Card className="p-8 text-center text-sm text-muted-foreground">订单不存在</Card>
      </AppLayout>
    );
  }

  const refresh = () => {
    const o = getOrder(id);
    setOrder(o);
    return o;
  };

  const handleCheckPaid = () => {
    if (qrOpen) {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const completedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      if (order.status === "待支付") addRemaining(order.quota);
      upsertOrder({ ...order, status: "已完成", completedAt });
      refresh();
      toast.success(`支付成功，${order.quota.toLocaleString()} 条已充值到账`);
    } else {
      toast.info("暂未查询到支付结果，请稍后重试，或在充值记录中查看状态");
    }
  };

  const handleCancel = () => {
    upsertOrder({ ...order, status: "已取消" });
    toast.message("订单已取消");
    navigate("/recharge/buy");
  };

  const openQr = () => {
    setQrOpen(true);
    const w = window.open("", "_blank", "width=520,height=640");
    if (!w) {
      toast.error("浏览器拦截了新窗口，请允许弹窗");
      return;
    }
    const title = order.method === "alipay" ? "支付宝" : "微信支付";
    w.document.write(`
<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;color:#111;background:#fafafa;margin:0}
.box{background:#fff;border:1px solid #eee;border-radius:8px;padding:24px;max-width:420px;margin:0 auto}
h1{font-size:16px;margin:0 0 16px}
.row{font-size:13px;color:#555;margin:4px 0}
.qr{width:240px;height:240px;margin:20px auto;display:grid;grid-template-columns:repeat(20,1fr);gap:2px;background:#fff;padding:12px;border:1px solid #eee;border-radius:6px}
.qr span{background:#111;border-radius:1px}
.hint{font-size:12px;color:#777;text-align:center;margin-top:12px}
.close{display:block;margin:20px auto 0;padding:8px 16px;background:#111;color:#fff;border:none;border-radius:4px;cursor:pointer}
</style></head><body>
<div class="box">
  <h1>${title}</h1>
  <div class="row">订单编号：${order.id}</div>
  <div class="row">支付金额：¥${order.amount.toLocaleString()}</div>
  <div class="row">套餐：${order.packageName} / ${order.quota.toLocaleString()} 条</div>
  <div class="qr" id="qr"></div>
  <div class="hint">请使用${title === "支付宝" ? "支付宝" : "微信"}扫码完成支付<br/>支付成功后可关闭本页面，返回原页面点击"我已完成支付"</div>
  <button class="close" onclick="window.close()">关闭窗口</button>
</div>
<script>
const qr=document.getElementById('qr');
for(let i=0;i<400;i++){const s=document.createElement('span');if(Math.random()>0.5)s.style.background='#111';else s.style.background='#fff';qr.appendChild(s);}
</script>
</body></html>`);
    w.document.close();
  };

  const title = order.method === "alipay" ? "支付宝" : "微信支付";

  return (
    <AppLayout breadcrumbs={[{ label: "充值中心", to: "/recharge/buy" }, { label: "支付订单" }]}>
      <Card className="mx-auto max-w-3xl p-4 md:p-6">
        <div className="grid grid-cols-2 gap-y-4">
          <Info label="已选套餐" value={order.packageName} />
          <Info label="购买条数" value={`${order.quota.toLocaleString()} 条`} />
          <Info label="支付金额" value={`¥${order.amount.toLocaleString()}`} highlight />
          <Info label="支付方式" value={title} />
          <Info label="订单编号" value={order.id} mono full />
          <Info label="创建时间" value={order.createdAt} />
          <div>
            <div className="text-xs text-muted-foreground">当前状态</div>
            <Badge variant="outline" className="mt-1 font-medium">{order.status}</Badge>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-muted/40 p-4 text-xs text-muted-foreground leading-relaxed">
          请在新打开的页面中完成支付，支付完成前不要关闭当前窗口。<br />
          支付完成后，可在充值记录中查看结果。
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 md:flex md:flex-wrap md:items-center md:gap-3">
          <Button onClick={openQr} disabled={order.status !== "待支付"} className="h-11 md:h-10">
            <QrCode className="mr-2 h-4 w-4" />打开支付二维码页面
          </Button>
          <Button variant="outline" onClick={handleCheckPaid} disabled={order.status !== "待支付"} className="h-11 md:h-10">
            我已完成支付
          </Button>
          <Button variant="ghost" onClick={handleCancel} disabled={order.status !== "待支付"} className="h-11 md:h-10">
            取消订单
          </Button>
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

export default PaymentOrder;
