import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/recharge/buy", label: "购买充值" },
  { to: "/recharge/records", label: "充值记录" },
];

export const RechargeNav = () => (
  <div className="mb-4 grid grid-cols-2 gap-1 rounded-md border border-border bg-card p-1 md:flex md:w-fit">
    {items.map((it) => (
      <NavLink
        key={it.to}
        to={it.to}
        className={({ isActive }) =>
          cn(
            "rounded px-4 py-2 text-center text-sm font-medium transition-colors md:py-1.5",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )
        }
      >
        {it.label}
      </NavLink>
    ))}
  </div>
);
