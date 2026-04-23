import { Link, useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { strategies as initialStrategies } from "@/data/mockData";
import { toast } from "sonner";

const StrategyList = () => {
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState(initialStrategies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = strategies.filter((s) => {
    const matchSearch = s.name.includes(search) || s.description.includes(search);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && s.enabled) ||
      (statusFilter === "disabled" && !s.enabled);
    return matchSearch && matchStatus;
  });

  const toggleEnabled = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
    toast.success("策略状态已更新");
  };

  return (
    <AppLayout
      breadcrumbs={[{ label: "策略配置" }]}
      actions={
        <Button onClick={() => navigate("/strategies/new")} size="sm" className="md:size-default">
          <Plus className="mr-1.5 h-4 w-4" />
          新建策略
        </Button>
      }
    >
      <Card className="border-border shadow-sm">
        {/* 筛选条 */}
        <div className="flex flex-col gap-2 border-b border-border p-3 md:flex-row md:flex-wrap md:items-center md:gap-3 md:p-4">
          <Input
            placeholder="策略名称搜索"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 md:w-64"
          />
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 flex-1 md:w-32 md:flex-none">
                <SelectValue placeholder="启用状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="enabled">已启用</SelectItem>
                <SelectItem value="disabled">已停用</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => { setSearch(""); setStatusFilter("all"); }}
            >
              重置
            </Button>
          </div>
          <div className="text-xs text-muted-foreground md:ml-auto">
            共 {filtered.length} 条 · 不需要时直接关闭
          </div>
        </div>

        {/* 桌面表格 */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16">序号</TableHead>
                <TableHead>策略名称</TableHead>
                <TableHead>策略描述</TableHead>
                <TableHead className="w-44">更新时间</TableHead>
                <TableHead className="w-24 text-center">启用</TableHead>
                <TableHead className="w-32 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell className="text-muted-foreground">{String(i + 1).padStart(2, "0")}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.description}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">{s.updatedAt}</TableCell>
                  <TableCell className="text-center">
                    <Switch checked={s.enabled} onCheckedChange={() => toggleEnabled(s.id)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                        <Link to={`/strategies/${s.id}`}>
                          <Eye className="mr-1 h-3.5 w-3.5" />查看
                        </Link>
                      </Button>
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-block">
                              {s.enabled ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-2 text-primary opacity-40"
                                  disabled
                                >
                                  <Pencil className="mr-1 h-3.5 w-3.5" />编辑
                                </Button>
                              ) : (
                                <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                                  <Link to={`/strategies/${s.id}/edit`}>
                                    <Pencil className="mr-1 h-3.5 w-3.5" />编辑
                                  </Link>
                                </Button>
                              )}
                            </span>
                          </TooltipTrigger>
                          {s.enabled && (
                            <TooltipContent side="top">
                              策略启用中不可编辑，请先关闭启用开关
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 移动端卡片列表 */}
        <div className="divide-y divide-border md:hidden">
          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">暂无符合条件的策略</div>
          )}
          {filtered.map((s) => (
            <div key={s.id} className="space-y-2.5 p-4">
              <div className="flex items-start justify-between gap-3">
                <Link
                  to={`/strategies/${s.id}`}
                  className="flex-1 text-sm font-semibold leading-snug hover:text-primary"
                >
                  {s.name}
                </Link>
                <Switch checked={s.enabled} onCheckedChange={() => toggleEnabled(s.id)} />
              </div>
              {s.description && (
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  更新于 {s.updatedAt}
                </span>
                <div className="flex gap-1">
                  <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                    <Link to={`/strategies/${s.id}`}>
                      <Eye className="mr-1 h-3.5 w-3.5" />查看
                    </Link>
                  </Button>
                  {s.enabled ? (
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-primary opacity-40" disabled>
                      <Pencil className="mr-1 h-3.5 w-3.5" />编辑
                    </Button>
                  ) : (
                    <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-primary">
                      <Link to={`/strategies/${s.id}/edit`}>
                        <Pencil className="mr-1 h-3.5 w-3.5" />编辑
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppLayout>
  );
};

export default StrategyList;
