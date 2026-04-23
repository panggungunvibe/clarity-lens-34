export interface Strategy {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  excludeKeywords: string[];
  enabled: boolean;
  updatedAt: string;
  notifyInbox: boolean;
}

export interface HeatBreakdown {
  reads: number;
  likes: number;
  comments: number;
  shares: number;
}

export type NegativeSentiment = "轻度负面" | "中度负面" | "重度负面";

export interface NegativeLog {
  id: string;
  title: string;
  source: string;
  sentiment: NegativeSentiment;
  publishedAt: string;
  windowKey: string; // 所属拉取窗口，如 "2026-04-22 10:00-11:00"
  heat: number;
  heatBreakdown: HeatBreakdown;
  strategy: string;
  author: string;
  summary: string;
  hitKeywords: string[];
  url: string;
}

export type TopicStatus = "待处理" | "持续关注" | "已处理" | "误报";

export interface Topic {
  id: string;
  name: string;
  count: number;
  timeRange: string;
  sources: string[];
  status: TopicStatus;
  summary: string;
  keywords: string[];
  logs: { logId?: string; title: string; source: string; time: string }[];
  note?: string;
}

export interface InboxNotification {
  id: string;
  unread: boolean;
  window: string;
  strategy: string;
  count: number;
  topicCount: number;
  mainTopics: string[];
}

export const strategies: Strategy[] = [
  {
    id: "1",
    name: "某品牌X70新机口碑监测策略",
    description: "针对某品牌X70系列新款手机发布后的全网负面舆情监测，覆盖产品体验、渠道、售后等维度",
    keywords: [
      "某品牌X70", "某品牌X70Pro", "某品牌X70Ultra", "BrandX X70", "X系列",
      "某品牌新款手机", "某品牌旗舰", "自研旗舰芯片", "自研影像系统", "卫星消息",
      "自研系统 4.2", "原生自研系统NEXT", "LTPO曲面屏", "2.5K屏幕", "120Hz高刷",
      "大电池续航", "100W有线快充", "80W无线快充", "机身发热严重", "信号差",
      "拍照不清晰", "夜景紫边", "长焦虚化", "防抖效果差", "门店排队",
      "线下体验差", "预约抢购卡顿", "现货紧张", "渠道加价", "黄牛炒价",
      "官方定价", "性价比低", "配置缩水", "开箱测评", "上手体验",
      "对比A品牌旗舰", "对比B品牌旗舰", "投诉售后", "客诉处理慢", "维修周期长",
      "保修拒赔", "换屏贵", "以旧换新估价低", "客服态度差", "服务不专业",
      "质量问题", "系统卡顿", "应用闪退", "重启黑屏", "OTA升级失败",
      "机身异响", "电池鼓包", "充电异常", "屏幕偏色", "烧屏",
      "摔落碎屏", "进水不保", "媒体误报", "差评轰炸", "网友吐槽",
      "消费者维权", "申请退货", "换货纠纷", "假货水货", "品牌官方商城",
      "京东自营", "天猫旗舰店", "抖音直播带货", "品牌高管发言", "品牌发布会",
      "官宣X70", "预热海报", "工程机测试", "官方样张", "安兔兔跑分",
      "5G信号弱", "基带表现", "卫星通信", "可变光圈", "计算光学",
      "遥遥领先", "品牌粉丝社群", "自研系统生态", "超级终端", "畅连通话",
      "品牌支付", "负面舆情", "口碑下滑", "销量不及预期", "库存积压", "以价换量",
    ],
    excludeKeywords: [],
    enabled: true,
    updatedAt: "2026-04-22 10:00",
    notifyInbox: true,
  },
  {
    id: "2",
    name: "某品牌终端口碑策略",
    description: "手机/门店服务/投诉负面内容监测",
    keywords: ["某品牌", "门店", "服务", "投诉", "售后"],
    excludeKeywords: [],
    enabled: true,
    updatedAt: "2026-04-22 09:30",
    notifyInbox: true,
  },
  {
    id: "3",
    name: "某品牌高管监测策略",
    description: "高管姓名相关负面内容监测",
    keywords: ["某品牌", "高管", "品牌高管A", "品牌高管B"],
    excludeKeywords: [],
    enabled: false,
    updatedAt: "2026-04-21 18:20",
    notifyInbox: true,
  },
];

export const recommendedKeywords = [
  "某品牌", "某品牌手机", "BrandX", "Y系列", "门店", "服务", "投诉", "电池", "续航", "X系列", "自研芯片",
];

export const recommendedExcludeKeywords = [
  "招聘", "壁纸", "主题下载", "二手", "广告投放", "代理", "测试帖",
];

export const timeWindows = [
  { key: "1h", label: "近1小时", windowLabel: "2026-04-22 10:00-11:00" },
  { key: "6h", label: "近6小时", windowLabel: "2026-04-22 05:00-11:00" },
  { key: "24h", label: "近24小时", windowLabel: "2026-04-21 11:00-2026-04-22 11:00" },
  { key: "7d", label: "近7天", windowLabel: "2026-04-15 - 2026-04-22" },
  { key: "30d", label: "近30天", windowLabel: "2026-03-23 - 2026-04-22" },
];

export const negativeLogs: NegativeLog[] = [
  {
    id: "01",
    title: "某测评博主质疑某品牌手机续航表现",
    source: "小红书",
    sentiment: "重度负面",
    publishedAt: "2026-04-22 10:35",
    windowKey: "1h",
    heat: 7560,
    heatBreakdown: { reads: 52000, likes: 3200, comments: 410, shares: 180 },
    strategy: "某品牌监测策略",
    author: "某科技测评博主",
    summary: "该博主在测评视频中提到，某品牌某机型在重度使用场景下续航表现一般，并与同价位竞品进行了对比。",
    hitKeywords: ["某品牌", "某品牌手机", "续航"],
    url: "https://www.xiaohongshu.com/explore/mock-001",
  },
  {
    id: "02",
    title: "用户投诉某品牌客服响应慢",
    source: "黑猫投诉",
    sentiment: "中度负面",
    publishedAt: "2026-04-22 10:20",
    windowKey: "1h",
    heat: 3150,
    heatBreakdown: { reads: 21000, likes: 980, comments: 220, shares: 60 },
    strategy: "某品牌终端口碑策略",
    author: "用户****8821",
    summary: "用户反映多次拨打某品牌客服热线均处于等待状态，问题未能及时解决。",
    hitKeywords: ["某品牌", "投诉", "服务"],
    url: "https://tousu.sina.com.cn/complaint/mock-002",
  },
  {
    id: "03",
    title: "某品牌门店服务被吐槽排队体验差",
    source: "微博",
    sentiment: "中度负面",
    publishedAt: "2026-04-22 10:08",
    windowKey: "1h",
    heat: 2480,
    heatBreakdown: { reads: 17500, likes: 720, comments: 165, shares: 45 },
    strategy: "某品牌终端口碑策略",
    author: "@数码爱好者",
    summary: "网友发文吐槽某市某品牌门店周末排队过长，服务效率低。",
    hitKeywords: ["某品牌", "门店", "服务"],
    url: "https://weibo.com/mock-003",
  },
  {
    id: "04",
    title: "部分用户讨论某品牌某机型发热问题",
    source: "论坛",
    sentiment: "轻度负面",
    publishedAt: "2026-04-22 08:17",
    windowKey: "6h",
    heat: 1740,
    heatBreakdown: { reads: 12000, likes: 510, comments: 120, shares: 28 },
    strategy: "某品牌监测策略",
    author: "论坛用户",
    summary: "部分用户在论坛反馈某机型在游戏场景下机身发热较明显。",
    hitKeywords: ["某品牌", "发热"],
    url: "https://bbs.example.com/thread/mock-004",
  },
  {
    id: "05",
    title: "旧闻误传为某品牌新品事故",
    source: "新闻",
    sentiment: "轻度负面",
    publishedAt: "2026-04-22 07:52",
    windowKey: "6h",
    heat: 1610,
    heatBreakdown: { reads: 9800, likes: 420, comments: 90, shares: 36 },
    strategy: "某品牌监测策略",
    author: "某资讯账号",
    summary: "部分自媒体将早前的旧闻重新包装为某品牌新品事故进行传播。",
    hitKeywords: ["某品牌"],
    url: "https://news.example.com/article/mock-005",
  },
];

// ===== 自动生成更多 mock 负面日志（模拟万级数据，按时间窗口分布）=====
const _titleTemplates = [
  "用户吐槽某品牌某机型续航不及预期",
  "测评博主对比某品牌与竞品拍照",
  "网友讨论某品牌客服电话排队过长",
  "门店导购被指诱导消费",
  "某品牌某机型升级后耗电变快",
  "论坛热议某品牌新品价格策略",
  "黑猫投诉曝光售后维修慢",
  "媒体跟进某品牌门店排队事件",
  "用户反映系统更新后卡顿",
  "短视频质疑某品牌信号问题",
  "网友对比某品牌与小米性价比",
  "某品牌旗舰机价格被指虚高",
  "用户投诉以旧换新估价低",
  "论坛讨论某品牌屏幕偏色",
  "媒体分析某品牌渠道加价乱象",
  "用户反馈某品牌充电器易坏",
  "网友讨论某品牌系统广告",
  "品牌发布会被吐槽节奏拖沓",
  "测评指出某品牌机型发热",
  "用户晒某品牌售后维修单",
];
const _sources = ["小红书", "微博", "论坛", "新闻", "黑猫投诉"];
const _strategies = ["某品牌监测策略", "某品牌终端口碑策略"];
const _authors = ["@数码大咖", "用户****1234", "某科技博主", "论坛用户", "媒体编辑", "@品牌用户群"];
const _hitGroups = [
  ["某品牌", "续航", "电池"],
  ["某品牌", "服务", "投诉"],
  ["某品牌", "门店", "排队"],
  ["某品牌", "价格", "性价比"],
  ["某品牌", "系统", "更新"],
  ["某品牌", "售后", "维修"],
  ["某品牌", "拍照", "摄像头"],
  ["某品牌", "信号"],
];

// windowKey 在前台快捷窗口中归类；自定义时间筛选按 publishedAt 实际比较
const _windowKeys = ["1h", "6h", "24h", "7d", "30d"] as const;
// 模拟万级数据：1小时窗口 ~12000 条，其它窗口在此基础上递增分布
const _windowDistribution: Record<string, number> = {
  "1h": 12000, "6h": 4800, "24h": 9000, "7d": 18000, "30d": 24000,
};

const _pad = (n: number) => String(n).padStart(2, "0");
const _fmtDate = (d: Date) =>
  `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())} ${_pad(d.getHours())}:${_pad(d.getMinutes())}`;

// 以 2026-04-22 11:00 为"现在"
const _now = new Date(2026, 3, 22, 11, 0, 0);
const _windowMaxAgeMin: Record<string, number> = {
  "1h": 60, "6h": 360, "24h": 1440, "7d": 7 * 1440, "30d": 30 * 1440,
};
const _windowMinAgeMin: Record<string, number> = {
  "1h": 0, "6h": 60, "24h": 360, "7d": 1440, "30d": 7 * 1440,
};

let _autoIdx = 100;
for (const wk of _windowKeys) {
  const count = _windowDistribution[wk];
  for (let i = 0; i < count; i++) {
    const minAge = _windowMinAgeMin[wk];
    const maxAge = _windowMaxAgeMin[wk];
    const ageMin = minAge + Math.floor(((i + 1) / (count + 1)) * (maxAge - minAge));
    const d = new Date(_now.getTime() - ageMin * 60_000);
    const tIdx = (i * 7 + wk.length) % _titleTemplates.length;
    const sIdx = (i * 3) % _sources.length;
    const stIdx = (i * 2) % _strategies.length;
    const aIdx = (i * 5) % _authors.length;
    const hIdx = (i * 11) % _hitGroups.length;
    const reads = 800 + ((i * 173) % 60000);
    const likes = Math.round(reads * 0.04 + (i % 50));
    const comments = Math.round(reads * 0.008 + (i % 30));
    const shares = Math.round(reads * 0.003 + (i % 15));
    const heat = Math.round(reads * 0.1 + likes * 0.5 + comments * 3 + shares * 5);
    // 按热度划分严重等级：>=5000 重度，>=2000 中度，否则轻度
    const sentiment: NegativeSentiment =
      heat >= 5000 ? "重度负面" : heat >= 2000 ? "中度负面" : "轻度负面";
    _autoIdx += 1;
    negativeLogs.push({
      id: `g${_autoIdx}`,
      title: `${_titleTemplates[tIdx]}（#${_autoIdx}）`,
      source: _sources[sIdx],
      sentiment,
      publishedAt: _fmtDate(d),
      windowKey: wk,
      heat,
      heatBreakdown: { reads, likes, comments, shares },
      strategy: _strategies[stIdx],
      author: _authors[aIdx],
      summary: `${_titleTemplates[tIdx]}。系统在 ${_fmtDate(d)} 抓取到该内容，被识别为负面。`,
      hitKeywords: _hitGroups[hIdx],
      url: `https://example.com/${_sources[sIdx]}/mock-${_autoIdx}`,
    });
  }
}


export const topics: Topic[] = [
  {
    id: "01",
    name: "某品牌手机续航争议",
    count: 1820,
    timeRange: "10:00-11:00",
    sources: ["小红书", "微博", "新闻"],
    status: "待处理",
    summary: "当前窗口内，多条负面日志围绕某品牌手机续航问题展开，主要集中在测评博主发声、用户体验反馈和论坛讨论。",
    keywords: ["某品牌", "手机", "续航", "电池", "掉电"],
    logs: [
      { logId: "01", title: "某测评博主质疑某品牌手机续航表现", source: "小红书", time: "10:35" },
      { logId: "02", title: "用户吐槽某品牌某机型电池掉电快", source: "微博", time: "10:22" },
      { logId: "03", title: "论坛讨论某品牌新机续航一般", source: "论坛", time: "10:11" },
      { logId: "04", title: "媒体跟进某品牌续航争议", source: "新闻", time: "10:06" },
    ],
    note: "已同步法务，待确认是否需要统一口径",
  },
  {
    id: "02",
    name: "某品牌Y系列价格讨论",
    count: 1540,
    timeRange: "10:00-11:00",
    sources: ["微博", "新闻"],
    status: "持续关注",
    summary: "围绕某品牌Y系列系列定价的讨论增多，涉及性价比对比与渠道价差。",
    keywords: ["某品牌", "Y系列", "价格", "贵", "性价比"],
    logs: [
      { title: "网友讨论某品牌Y系列新机定价偏高", source: "微博", time: "09:48" },
      { title: "媒体分析某品牌Y系列价格策略", source: "新闻", time: "09:30" },
    ],
  },
  {
    id: "03",
    name: "某品牌客服响应投诉",
    count: 1180,
    timeRange: "10:00-11:00",
    sources: ["黑猫投诉", "论坛"],
    status: "已处理",
    summary: "黑猫投诉与论坛集中出现关于某品牌客服响应慢、流程繁琐的反馈。",
    keywords: ["某品牌", "客服", "投诉", "响应慢"],
    logs: [
      { title: "用户投诉某品牌客服响应慢", source: "黑猫投诉", time: "08:56" },
    ],
  },
  {
    id: "04",
    name: "某品牌门店服务体验争议",
    count: 960,
    timeRange: "10:00-11:00",
    sources: ["微博", "论坛"],
    status: "误报",
    summary: "聚类结果中混入了门店招聘等无关内容，主题不成立。",
    keywords: ["某品牌", "门店", "服务", "排队"],
    logs: [
      { title: "某品牌门店服务被吐槽排队体验差", source: "微博", time: "08:31" },
    ],
  },
  {
    id: "05",
    name: "某品牌某机型发热讨论",
    count: 820,
    timeRange: "10:00-11:00",
    sources: ["论坛", "新闻"],
    status: "待处理",
    summary: "部分用户在论坛与媒体讨论某机型在重负载下的发热表现。",
    keywords: ["某品牌", "发热", "游戏", "性能"],
    logs: [
      { title: "部分用户讨论某品牌某机型发热问题", source: "论坛", time: "08:17" },
    ],
  },
  { id: "06", name: "某品牌售后维修流程讨论", count: 720, timeRange: "10:00-11:00", sources: ["微博"], status: "待处理", summary: "用户讨论某品牌售后维修流程的等待时长与费用透明度。", keywords: ["某品牌", "售后", "维修"], logs: [] },
  { id: "07", name: "某品牌系统更新争议", count: 640, timeRange: "10:00-11:00", sources: ["论坛", "微博"], status: "待处理", summary: "新系统更新后部分机型出现兼容问题。", keywords: ["某品牌", "自研系统", "更新"], logs: [] },
  { id: "08", name: "某品牌渠道价格混乱", count: 560, timeRange: "10:00-11:00", sources: ["微博"], status: "持续关注", summary: "多地渠道商存在加价或捆绑销售情况。", keywords: ["某品牌", "渠道", "加价"], logs: [] },
  { id: "09", name: "某品牌摄像头表现讨论", count: 480, timeRange: "10:00-11:00", sources: ["小红书"], status: "待处理", summary: "测评内容讨论摄像头在弱光环境下的表现。", keywords: ["某品牌", "摄像头", "拍照"], logs: [] },
  { id: "10", name: "某品牌品牌广告争议", count: 420, timeRange: "10:00-11:00", sources: ["微博"], status: "待处理", summary: "部分广告物料引发网友讨论。", keywords: ["某品牌", "广告"], logs: [] },
  { id: "11", name: "某品牌线下活动反馈", count: 360, timeRange: "10:00-11:00", sources: ["微博", "小红书"], status: "已处理", summary: "线下体验活动现场组织被部分用户吐槽。", keywords: ["某品牌", "活动", "体验"], logs: [] },
  { id: "12", name: "某品牌周边配件投诉", count: 310, timeRange: "10:00-11:00", sources: ["黑猫投诉"], status: "待处理", summary: "充电器、保护壳等配件被投诉质量问题。", keywords: ["某品牌", "配件", "充电器"], logs: [] },
  { id: "13", name: "某品牌预约抢购体验", count: 270, timeRange: "10:00-11:00", sources: ["微博"], status: "待处理", summary: "新机抢购页面卡顿被吐槽。", keywords: ["某品牌", "抢购", "预约"], logs: [] },
  { id: "14", name: "某品牌竞品对比讨论", count: 240, timeRange: "10:00-11:00", sources: ["论坛"], status: "持续关注", summary: "与竞品在价格与配置上的对比讨论。", keywords: ["某品牌", "对比", "竞品"], logs: [] },
  { id: "15", name: "某品牌以旧换新流程", count: 210, timeRange: "10:00-11:00", sources: ["黑猫投诉"], status: "待处理", summary: "以旧换新估价偏低被投诉。", keywords: ["某品牌", "以旧换新"], logs: [] },
  { id: "16", name: "品牌账号安全问题", count: 180, timeRange: "10:00-11:00", sources: ["论坛"], status: "待处理", summary: "用户反映账号异地登录提醒频繁。", keywords: ["品牌账号", "安全"], logs: [] },
  { id: "17", name: "某品牌应用市场体验", count: 150, timeRange: "10:00-11:00", sources: ["论坛"], status: "待处理", summary: "应用更新失败被吐槽。", keywords: ["应用市场", "更新失败"], logs: [] },
  { id: "18", name: "某品牌屏幕显示问题", count: 130, timeRange: "10:00-11:00", sources: ["微博"], status: "待处理", summary: "部分机型屏幕显示偏色被反馈。", keywords: ["某品牌", "屏幕", "偏色"], logs: [] },
  { id: "19", name: "品牌发布会反馈", count: 110, timeRange: "10:00-11:00", sources: ["微博", "新闻"], status: "已处理", summary: "发布会节奏与内容被部分网友评论。", keywords: ["某品牌", "发布会"], logs: [] },
  { id: "20", name: "某品牌售后小程序体验", count: 90, timeRange: "10:00-11:00", sources: ["微博"], status: "待处理", summary: "售后小程序的预约流程被讨论。", keywords: ["某品牌", "小程序", "售后"], logs: [] },
];

export const inboxNotifications: InboxNotification[] = [
  {
    id: "n1",
    unread: true,
    window: "10:00-11:00",
    strategy: "某品牌监测策略",
    count: 96,
    topicCount: 24,
    mainTopics: ["续航争议", "价格讨论", "客服投诉"],
  },
  {
    id: "n2",
    unread: false,
    window: "09:00-10:00",
    strategy: "某品牌监测策略",
    count: 82,
    topicCount: 19,
    mainTopics: ["门店服务", "发热讨论", "价格争议"],
  },
  {
    id: "n3",
    unread: false,
    window: "08:00-09:00",
    strategy: "某品牌监测策略",
    count: 63,
    topicCount: 14,
    mainTopics: ["客服投诉", "门店体验", "售后维修"],
  },
];
