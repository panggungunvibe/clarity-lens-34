import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Lock, User as UserIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { isAuthenticated, login, MOCK_ACCOUNT } from "@/lib/auth";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate("/strategies", { replace: true });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = login(username.trim(), password);
      setLoading(false);
      if (user) {
        toast.success(`欢迎回来，${user.displayName}`);
        navigate("/strategies", { replace: true });
      } else {
        toast.error("账号或密码错误");
      }
    }, 300);
  };

  const fillMock = () => {
    setUsername(MOCK_ACCOUNT.username);
    setPassword(MOCK_ACCOUNT.password);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-sidebar via-sidebar to-primary/30 p-6">
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-xl shadow-2xl md:grid-cols-2">
        {/* 左侧品牌区 */}
        <div className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground md:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sidebar-primary">
              <Activity className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold text-white">舆情监控平台</span>
              <span className="text-xs text-sidebar-foreground/60">Sentiment Monitor</span>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white leading-snug">
              聚焦负面舆情<br />洞察即时主题动向
            </h2>
            <p className="text-sm text-sidebar-foreground/70 leading-relaxed">
              基于策略命中 + 情感识别 + HDBSCAN 自动聚类，
              帮助品牌团队快速发现并响应每个时间窗口的关键负面话题。
            </p>
          </div>
          <div className="text-[11px] text-sidebar-foreground/50">
            MVP v1.0 · 2026
          </div>
        </div>

        {/* 右侧表单 */}
        <Card className="flex flex-col justify-center rounded-none border-0 bg-card p-10">
          <div className="mb-8 space-y-1.5">
            <h1 className="text-2xl font-semibold">账号登录</h1>
            <p className="text-sm text-muted-foreground">请输入账号和密码以进入控制台</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">账号</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入账号"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中…" : "登录"}
            </Button>
          </form>

          <button
            type="button"
            onClick={fillMock}
            className="mt-4 flex w-full items-start gap-2 rounded-md border border-info/20 bg-info-soft px-3 py-2.5 text-left text-xs text-info transition-colors hover:bg-info/10"
          >
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              演示账号：<span className="font-medium">{MOCK_ACCOUNT.username}</span> /
              密码：<span className="font-medium">{MOCK_ACCOUNT.password}</span>
              <span className="ml-1 underline">点击自动填入</span>
            </span>
          </button>
        </Card>
      </div>
    </div>
  );
};

export default Login;
