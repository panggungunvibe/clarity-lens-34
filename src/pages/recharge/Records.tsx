import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  account,
  getOrders,
  getRemaining,
  methodLabel,
  type OrderStatus,
  type PaymentMethod,
} from "@/data/rechargeMock";
import { RechargeNav } from "./RechargeNav";
import { useIsMobile } from "@/hooks/use-mobile";

const STATUS_STYLE: Record<OrderStatus, string> = {
  待支付: "bg-warning-soft text-warning border-warning/20",
  待汇款: "bg-warning-soft text-warning border-warning/20",
  待人工确认: "bg-info-soft text-info border-info/20",
  已完成: "bg-success-soft text-success border-success/20",
  已取消: "bg-muted text-muted-foreground border-border",
  已失败: "bg-destructive-soft text-destructive border-destructive/20",
  已过期: "bg-muted text-muted-foreground border-border",
};

const ALL_STATUS: OrderStatus[] = [
  "待支付", "待汇款", "待人工确认", "已完成", "已取消", "已失败", "已过期",
];

const Records = () => {
  const [orders] = useState(() => getOrders());
  const [typeFilter, setTypeFilter] = useState<"all" | PaymentMethod>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const filtered = useMemo(() => {
    const kw = search.trim();
    return orders.filter((o) => {
      const mt = typeFilter === "all" || o.method === typeFilter;
      const ms = statusFilter === "all" || o.status === statusFilter;
      const mk = !kw || o.id.includes(kw);
      return mt && ms && mk;
    });
  }, [orders, typeFilter, statusFilter, search]);

  return (
    <AppLayout breadcrumbs={[{ label: "充值中心", to: "/recharge/buy" }, { label: "充值记录" }]}>
      <RechargeNav />
      <div className="space-y-4">
        <Card className="p-4 md:p-5">
          <div className="grid grid-cols-2 gap-y-3">
            <Info label="当前剩余条数" value={`${getRemaining().toLocaleString()} 条`} highlight />
            <Info label="当前生效套餐" value={account.currentPackage} />
          </div>
        </Card>

        <Card>
          <div className="border-b border-border p-4 text-sm font-semibold">充值记录</div>
          <div className="space-y-2 border-b border-border p-3 md:flex md:flex-wrap md:items-center md:gap-3 md:space-y-0 md:p-4">
            <div className="grid grid-cols-2 gap-2 md:contents">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                <SelectTrigger className="h-9 md:w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="wechat">微信支付</SelectItem>
                  <SelectItem value="alipay">支付宝</SelectItem>
                  <SelectItem value="bank">企业汇款</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="h-9 md:w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  {ALL_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索订单编号"
              className="h-9 md:w-56"
            />
            <div className="text-xs text-muted-foreground md:ml-auto">共 {filtered.length} 条记录</div>
          </div>

          {/* 移动端：卡片列表 */}
          {isMobile ? (
            <div className="divide-y divide-border">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">暂无记录</div>
              ) : (
                filtered.map((o) => (
                  <Link
                    key={o.id}
                    to={`/recharge/orders/${o.id}`}
                    className="block px-4 py-3 active:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-xs text-muted-foreground truncate">{o.id}</div>
                        <div className="mt-1 text-sm font-medium">{methodLabel[o.method]}</div>
                      </div>
                      <Badge variant="outline" className={cn("shrink-0 font-medium", STATUS_STYLE[o.status])}>{o.status}</Badge>
                    </div>
                    <div className="mt-2 flex items-end justify-between gap-2">
                      <div className="text-xs text-muted-foreground tabular-nums">
                        创建：{o.createdAt}
                        {o.completedAt && <><br />完成：{o.completedAt}</>}
                      </div>
                      <div className="text-base font-bold text-primary tabular-nums">¥{o.amount.toLocaleString()}</div>
                    </div>
                    {(o.status === "已取消" || o.status === "已失败" || o.status === "已过期") && (
                      <div className="mt-2 text-right">
                        <Link to={`/recharge/pay/${o.id}`} onClick={(e) => e.stopPropagation()} className="text-xs text-primary hover:underline">重新支付</Link>
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单编号</TableHead>
                  <TableHead>充值类型</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>完成时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">暂无记录</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id}</TableCell>
                      <TableCell>{methodLabel[o.method]}</TableCell>
                      <TableCell className="tabular-nums">¥{o.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-medium", STATUS_STYLE[o.status])}>{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs tabular-nums">{o.createdAt}</TableCell>
                      <TableCell className="text-xs tabular-nums">{o.completedAt ?? "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-3">
                          {(o.status === "已取消" || o.status === "已失败" || o.status === "已过期") && (
                            <Link to={`/recharge/pay/${o.id}`} className="text-xs text-primary hover:underline">重新支付</Link>
                          )}
                          <Link to={`/recharge/orders/${o.id}`} className="text-xs text-primary hover:underline">详情</Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </AppLayout>
  );
};

const Info = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={cn("mt-1 text-base font-semibold tabular-nums", highlight && "text-primary")}>{value}</div>
  </div>
);

export default Records;
