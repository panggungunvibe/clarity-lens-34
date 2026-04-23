import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

const DateTimeRangePicker = ({ value, onChange, triggerClassName }: Props) => {
  const [open, setOpen] = React.useState(false);
  const [fromDate, setFromDate] = React.useState<Date | undefined>(value?.from);
  const [toDate, setToDate] = React.useState<Date | undefined>(value?.to);
  const [fromHour, setFromHour] = React.useState<string>(value ? pad(value.from.getHours()) : "00");
  const [toHour, setToHour] = React.useState<string>(value ? pad(value.to.getHours()) : "23");

  React.useEffect(() => {
    if (open) {
      setFromDate(value?.from);
      setToDate(value?.to);
      setFromHour(value ? pad(value.from.getHours()) : "00");
      setToHour(value ? pad(value.to.getHours()) : "23");
    }
  }, [open, value]);

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

  const label = value ? `${fmt(value.from)} ~ ${fmt(value.to)}` : "自定义时间范围";
  const valid = fromDate && toDate && (() => {
    const f = new Date(fromDate); f.setHours(parseInt(fromHour, 10) || 0);
    const t = new Date(toDate); t.setHours(parseInt(toHour, 10) || 0);
    return t.getTime() >= f.getTime();
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-[30px] gap-1.5 px-3 text-xs font-normal",
            value && "border-primary text-primary",
            triggerClassName
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          {value ? label : "自定义"}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-1.5rem)] max-w-[640px] p-0 sm:w-auto"
        align="start"
      >
        <div className="flex max-h-[70vh] flex-col divide-y divide-border overflow-y-auto md:flex-row md:divide-x md:divide-y-0 md:overflow-visible">
          {/* 起始 */}
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
            <div className="mt-3 flex items-center gap-2 px-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs">小时</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={fromHour}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(23, parseInt(e.target.value || "0", 10)));
                  setFromHour(pad(v));
                }}
                className="h-7 w-16 tabular-nums"
              />
              <span className="text-xs text-muted-foreground">:00</span>
            </div>
          </div>

          {/* 结束 */}
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
            <div className="mt-3 flex items-center gap-2 px-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs">小时</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={toHour}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(23, parseInt(e.target.value || "0", 10)));
                  setToHour(pad(v));
                }}
                className="h-7 w-16 tabular-nums"
              />
              <span className="text-xs text-muted-foreground">:00</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-2.5">
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
              <span className="ml-2 text-destructive">结束时间需晚于起始</span>
            )}
          </div>
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
