"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/trackrs");
        if (res.data.success) {
          const data = res.data.data;
          const now = new Date().setHours(0, 0, 0, 0);

          setStats({
            total: data.length,
            completed: data.filter((t) => t.completed).length,
            pending: data.filter((t) => !t.completed).length,
            overdue: data.filter(
              (t) =>
                !t.completed &&
                t.dueDate &&
                new Date(t.dueDate).setHours(0, 0, 0, 0) < now,
            ).length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Trackrs",
      value: stats.total,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-lg text-gray-500 mt-2">
          Welcome back! Here's an overview of your productivity.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/leetcode"
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#FFA116] p-2 rounded-lg">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">LeetCode Hub</p>
                  <p className="text-sm text-gray-500">
                    Solve and save LeetCode problems
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-black transition-colors" />
            </Link>
          </div>
        </div>

        <div className="bg-black text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Productivity Tip</h2>
            <p className="text-gray-400">
              Try to complete your higher priority tasks early in the morning
              for maximum focus.
            </p>
          </div>
          <button className="mt-8 bg-white text-black font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors w-fit">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
