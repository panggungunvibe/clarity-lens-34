export interface RechargePackage {
  id: string;
  name: string;
  quota: number;
  price: number;
  desc: string;
}

export type PaymentMethod = "wechat" | "alipay" | "bank";
export type OrderStatus =
  | "待支付"
  | "待汇款"
  | "待人工确认"
  | "已完成"
  | "已取消"
  | "已失败"
  | "已过期";

export interface RechargeOrder {
  id: string;
  packageId: string;
  packageName: string;
  quota: number;
  amount: number;
  method: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string;
}

export const rechargePackages: RechargePackage[] = [
  { id: "p1", name: "基础包", quota: 1000, price: 199, desc: "适合试用" },
  { id: "p2", name: "标准包", quota: 5000, price: 899, desc: "适合常规使用" },
  { id: "p3", name: "高级包", quota: 10000, price: 1599, desc: "适合高频使用" },
  { id: "p4", name: "企业包", quota: 50000, price: 6999, desc: "适合企业批量使用" },
];

export const account = {
  name: "企业统一账号001",
  used: 87420,
  currentPackage: "标准包",
};

const BALANCE_KEY = "recharge_balance_v1";
const INITIAL_BALANCE = 12580;

export function getRemaining(): number {
  try {
    const raw = localStorage.getItem(BALANCE_KEY);
    if (raw !== null) return Number(raw) || 0;
  } catch {}
  localStorage.setItem(BALANCE_KEY, String(INITIAL_BALANCE));
  return INITIAL_BALANCE;
}

export function addRemaining(delta: number): number {
  const next = getRemaining() + delta;
  localStorage.setItem(BALANCE_KEY, String(next));
  return next;
}

export const payeeInfo = {
  company: "天梁（深圳）人工智能科技有限公司",
  taxId: "91440300MAD2D03H1H",
  address: "深圳市南山区粤海街道高新区社区科苑南路3170号留学生创业大厦一期1301",
  phone: "0755-86978489",
  bank: "中国光大银行股份有限公司深圳景田支行",
  bankAccount: "39050180800922038",
  serviceWechat: "service_xxx",
};

const STORAGE_KEY = "recharge_orders_v1";

const seedOrders: RechargeOrder[] = [
  {
    id: "CZ202604220001",
    packageId: "p2",
    packageName: "标准包",
    quota: 5000,
    amount: 899,
    method: "wechat",
    status: "已完成",
    createdAt: "2026-04-22 10:12",
    completedAt: "2026-04-22 10:15",
  },
  {
    id: "CZ202604210014",
    packageId: "p4",
    packageName: "企业包",
    quota: 50000,
    amount: 6999,
    method: "bank",
    status: "待人工确认",
    createdAt: "2026-04-21 16:43",
  },
  {
    id: "CZ202604200008",
    packageId: "p1",
    packageName: "基础包",
    quota: 1000,
    amount: 199,
    method: "alipay",
    status: "已取消",
    createdAt: "2026-04-20 09:20",
  },
  {
    id: "CZ202604190003",
    packageId: "p3",
    packageName: "高级包",
    quota: 10000,
    amount: 1599,
    method: "wechat",
    status: "已失败",
    createdAt: "2026-04-19 14:50",
  },
];

export function getOrders(): RechargeOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedOrders));
  return seedOrders;
}

export function saveOrders(list: RechargeOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getOrder(id: string): RechargeOrder | undefined {
  return getOrders().find((o) => o.id === id);
}

export function upsertOrder(order: RechargeOrder) {
  const list = getOrders();
  const i = list.findIndex((o) => o.id === order.id);
  if (i >= 0) list[i] = order;
  else list.unshift(order);
  saveOrders(list);
}

export function createOrder(pkg: RechargePackage, method: PaymentMethod): RechargeOrder {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const id =
    "CZ" +
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const order: RechargeOrder = {
    id,
    packageId: pkg.id,
    packageName: pkg.name,
    quota: pkg.quota,
    amount: pkg.price,
    method,
    status: method === "bank" ? "待汇款" : "待支付",
    createdAt,
  };
  upsertOrder(order);
  return order;
}

export const methodLabel: Record<PaymentMethod, string> = {
  wechat: "微信支付",
  alipay: "支付宝",
  bank: "企业汇款",
};
