import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

export interface DateTimeRange {
  from: Date;
  to: Date;
}

interface Props {
  value?: DateTimeRange;
  onChange: (range: DateTimeRange) => void;
  triggerClassName?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) => `${format(d, "yyyy-MM-dd")} ${pad(d.getHours())}:00`;
const fmtShort = (d: Date) => `${format(d, "MM-dd")} ${pad(d.getHours())}:00`;

const DateTimeRangePicker = ({ value, onChange, triggerClassName }: Props) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const [fromDate, setFromDate] = React.useState<Date | undefined>(value?.from);
  const [toDate, setToDate] = React.useState<Date | undefined>(value?.to);
  const [fromHour, setFromHour] = React.useState<string>(value ? pad(value.from.getHours()) : "00");
  const [toHour, setToHour] = React.useState<string>(value ? pad(value.to.getHours()) : "23");
  const [activeTab, setActiveTab] = React.useState<"from" | "to">("from");

  React.useEffect(() => {
    if (open) {
      setFromDate(value?.from);
      setToDate(value?.to);
      setFromHour(value ? pad(value.from.getHours()) : "00");
      setToHour(value ? pad(value.to.getHours()) : "23");
      setActiveTab("from");
    }
  }, [open, value]);

  const valid = fromDate && toDate && (() => {
    const f = new Date(fromDate); f.setHours(parseInt(fromHour, 10) || 0);
    const t = new Date(toDate); t.setHours(parseInt(toHour, 10) || 0);
    return t.getTime() >= f.getTime();
  })();

  const apply = () => {
    if (!fromDate || !toDate) return;
    const from = new Date(fromDate);
    from.setHours(parseInt(fromHour, 10) || 0, 0, 0, 0);
    const to = new Date(toDate);
    to.setHours(parseInt(toHour, 10) || 0, 0, 0, 0);
    if (to.getTime() < from.getTime()) return;
    onChange({ from, to });
    setOpen(false);
  };

  const triggerLabel = value ? (isMobile ? `${fmtShort(value.from)} ~ ${fmtShort(value.to)}` : `${fmt(value.from)} ~ ${fmt(value.to)}`) : "自定义";

  const HourInput = ({ val, onSet }: { val: string; onSet: (v: string) => void }) => (
    <div className="flex items-center gap-2 px-1">
      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
      <Label className="text-xs">小时</Label>
      <Input
        type="number"
        min={0}
        max={23}
        value={val}
        onChange={(e) => {
          const v = Math.max(0, Math.min(23, parseInt(e.target.value || "0", 10)));
          onSet(pad(v));
        }}
        className="h-8 w-16 tabular-nums"
      />
      <span className="text-xs text-muted-foreground">:00</span>
    </div>
  );

  const summary = (
    <div className="text-xs text-muted-foreground">
      {fromDate && toDate ? (
        <span className="tabular-nums">
          {format(fromDate, "yyyy-MM-dd")} {fromHour}:00
          <span className="mx-1.5">~</span>
          {format(toDate, "yyyy-MM-dd")} {toHour}:00
        </span>
      ) : (
        "请选择起止日期"
      )}
      {!valid && fromDate && toDate && (
        <span className="ml-2 text-destructive">结束需晚于起始</span>
      )}
    </div>
  );

  const trigger = (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "h-[30px] gap-1.5 px-3 text-xs font-normal",
        value && "border-primary text-primary",
        isMobile && "max-w-full truncate",
        triggerClassName
      )}
    >
      <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{value ? triggerLabel : "自定义"}</span>
    </Button>
  );

  // 移动端：Bottom Sheet + Tabs 切换起止日期
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-xl p-0">
          <SheetHeader className="border-b border-border px-4 py-3 text-left">
            <SheetTitle className="text-base">自定义时间范围</SheetTitle>
          </SheetHeader>
          <div className="max-h-[70vh] overflow-y-auto px-4 py-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "from" | "to")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="from" className="text-xs">
                  起始 {fromDate && <span className="ml-1 tabular-nums opacity-70">{format(fromDate, "MM-dd")} {fromHour}:00</span>}
                </TabsTrigger>
                <TabsTrigger value="to" className="text-xs">
                  结束 {toDate && <span className="ml-1 tabular-nums opacity-70">{format(toDate, "MM-dd")} {toHour}:00</span>}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="from" className="mt-3 space-y-3">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    className={cn("p-0 pointer-events-auto")}
                  />
                </div>
                <HourInput val={fromHour} onSet={setFromHour} />
              </TabsContent>
              <TabsContent value="to" className="mt-3 space-y-3">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    className={cn("p-0 pointer-events-auto")}
                  />
                </div>
                <HourInput val={toHour} onSet={setToHour} />
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-2 border-t border-border bg-muted/30 px-4 py-3">
            <div className="text-center">{summary}</div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>取消</Button>
              {activeTab === "from" && fromDate ? (
                <Button className="flex-1" onClick={() => setActiveTab("to")}>下一步</Button>
              ) : (
                <Button className="flex-1" disabled={!valid} onClick={apply}>应用</Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // 桌面端：Popover 双日历
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-auto max-w-[640px] p-0" align="start">
        <div className="flex divide-x divide-border">
          <div className="p-3">
            <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />起始日期
            </div>
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={setFromDate}
              initialFocus
              className={cn("p-0 pointer-events-auto")}
            />
            <div className="mt-3"><HourInput val={fromHour} onSet={setFromHour} /></div>
          </div>
          <div className="p-3">
            <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />结束日期
            </div>
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={setToDate}
              className={cn("p-0 pointer-events-auto")}
            />
            <div className="mt-3"><HourInput val={toHour} onSet={setToHour} /></div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2.5">
          {summary}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-7" onClick={() => setOpen(false)}>取消</Button>
            <Button size="sm" className="h-7" disabled={!valid} onClick={apply}>应用</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateTimeRangePicker;
