"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Settings,
  BarChart3,
  Plus,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Todos", href: "/todos", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "LeetCode", href: "/leetcode", icon: Trophy },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar({ isCollapsed, onToggle }) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 flex flex-col pt-16 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 transition-colors z-50 text-gray-400 hover:text-black"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className="flex-1 px-4 py-8 space-y-8 overflow-x-hidden">
        <div className="space-y-1">
          <p
            className={clsx(
              "px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 transition-opacity duration-200",
              isCollapsed && "opacity-0",
            )}
          >
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-black text-white shadow-lg shadow-black/10"
                    : "text-gray-500 hover:text-black hover:bg-gray-100",
                  isCollapsed && "justify-center px-0",
                )}
                title={isCollapsed ? item.name : ""}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span
                  className={clsx(
                    "transition-all duration-200 whitespace-nowrap",
                    isCollapsed
                      ? "w-0 opacity-0 overflow-hidden"
                      : "w-auto opacity-100",
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="px-3">
          <Link
            href="/todos"
            className={clsx(
              "flex items-center justify-center gap-2 w-full py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-black hover:text-black hover:bg-white transition-all group overflow-hidden",
              isCollapsed &&
                "px-0 border-none bg-transparent hover:bg-gray-100",
            )}
            title={isCollapsed ? "New Task" : ""}
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform shrink-0" />
            <span
              className={clsx(
                "transition-all duration-200 whitespace-nowrap",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              New Task
            </span>
          </Link>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 overflow-hidden">
        <Link
          href="/settings"
          className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-black text-white"
              : "text-gray-600 hover:text-black hover:bg-gray-100",
            isCollapsed && "justify-center px-0",
          )}
          title={isCollapsed ? "Settings" : ""}
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span
            className={clsx(
              "transition-all duration-200 whitespace-nowrap",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}
