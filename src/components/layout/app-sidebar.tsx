import Link from "next/link";
import { LayoutDashboard, Users2, Settings } from "lucide-react";
import { LogoutButton } from "@/components/layout/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partners", label: "Партнёры", icon: Users2 },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-col shrink-0 border-r border-line bg-panel/60 px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-75 animate-pulse-dot" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal" />
        </span>
        <span className="font-display font-medium text-[15px] tracking-tight">
          Partner OS
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href as any}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-fog hover:text-paper hover:bg-panel-raised transition-colors"
          >
            <item.icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-line">
        <LogoutButton />
        <p className="text-xs text-fog font-mono leading-relaxed px-3 pt-3">
          MVP v0.1
        </p>
      </div>
    </aside>
  );
}
