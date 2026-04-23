import { NavLink, useNavigate, Link } from "react-router-dom";
import { Bell, Settings, Target, AlertTriangle, Sparkles, ChevronRight, Activity, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { inboxNotifications } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { getCurrentUser, logout } from "@/lib/auth";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { to: "/analysis", label: "智能分析", icon: Sparkles },
  { to: "/strategies", label: "策略配置", icon: Target },
  { to: "/alerts", label: "告警日志", icon: AlertTriangle },
  { to: "/settings", label: "系统设置", icon: Settings },
];

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumbs: { label: string; to?: string }[];
  actions?: React.ReactNode;
}

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
  <>
    <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
        <Activity className="h-4 w-4 text-sidebar-primary-foreground" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-white">舆情监控平台</span>
        <span className="text-[10px] text-sidebar-foreground/60">Sentiment Monitor</span>
      </div>
    </div>
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
    <div className="border-t border-sidebar-border p-4 text-[11px] text-sidebar-foreground/50">
      MVP v1.0 · 2026
    </div>
  </>
);

export const AppLayout = ({ children, breadcrumbs, actions }: AppLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [notifications] = useState(inboxNotifications);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;
  const user = getCurrentUser();
  const initials = (user?.displayName ?? "AD").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    toast.success("已退出登录");
    navigate("/login", { replace: true });
  };

  // 当前页（最后一个面包屑）用于移动端 Header 标题
  const currentPageLabel = breadcrumbs[breadcrumbs.length - 1]?.label ?? "";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* 桌面端侧栏 */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-3 md:px-6">
          {/* 移动端：汉堡菜单 + 标题 */}
          <div className="flex flex-1 items-center gap-2 md:hidden">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[260px] flex flex-col bg-sidebar p-0 text-sidebar-foreground border-sidebar-border"
              >
                <SidebarContent onNavigate={() => setDrawerOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="truncate text-base font-semibold">{currentPageLabel}</h1>
          </div>

          {/* 桌面端右侧操作 */}
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[calc(100vw-1.5rem)] max-w-[440px] p-0"
                align="end"
                sideOffset={8}
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">通知中心</span>
                    <Badge variant="secondary" className="h-5 text-[10px]">{unreadCount} 未读</Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">全部已读</Button>
                </div>
                <div className="max-h-[60vh] md:max-h-[420px] overflow-y-auto">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      to="/analysis"
                      className="block border-b border-border px-4 py-3 transition-colors hover:bg-muted/50 last:border-0"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                            n.unread ? "bg-destructive" : "bg-transparent"
                          )}
                        />
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{n.window}</span>
                            <span>·</span>
                            <span className="truncate">{n.strategy}</span>
                          </div>
                          <p className="text-sm leading-snug text-foreground">
                            识别 <span className="font-semibold text-destructive">{n.count}</span> 条负面日志，聚类出{" "}
                            <span className="font-semibold">{n.topicCount}</span> 个主题
                          </p>
                          <p className="text-xs text-muted-foreground">
                            主要主题：{n.mainTopics.join(" / ")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border-l border-border pl-2 md:pl-3 outline-none transition-opacity hover:opacity-80">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-xs font-medium">{user?.displayName ?? "管理员"}</span>
                    <span className="text-[10px] text-muted-foreground">{user?.email ?? "admin@platform"}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{user?.displayName ?? "管理员"}</span>
                    <span className="text-xs text-muted-foreground">{user?.username ?? "admin"}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Breadcrumb / Action bar */}
        {/* 桌面：面包屑 + 操作；移动：仅操作（标题已在 Header 显示） */}
        {(actions || !isMobile) && (
          <div className="flex min-h-[3.25rem] shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-3 py-2 md:h-14 md:px-6 md:py-0">
            <nav className="hidden md:flex items-center gap-1.5 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-foreground">首页</Link>
              {breadcrumbs.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                  {b.to ? (
                    <Link to={b.to} className="text-muted-foreground hover:text-foreground">{b.label}</Link>
                  ) : (
                    <span className="font-medium text-foreground">{b.label}</span>
                  )}
                </div>
              ))}
            </nav>
            {actions && (
              <div className="flex w-full md:w-auto items-center justify-end gap-2 [&>*]:flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 md:p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};
