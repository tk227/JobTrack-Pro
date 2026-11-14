
import { useMemo } from "react";
import { motion } from "framer-motion";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  BriefcaseBusiness,
  CheckCircle2,
  XCircle,
  CalendarDays,
  TrendingUp,
  Target,
  Activity,
} from "lucide-react";

const COLORS = [
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#10b981",
  "#ef4444",
];

function Analytics({ jobs = [], interviews = [] }) {
  const total = jobs.length;

  const counts = {
    applied: jobs.filter((job) => job.status === "applied").length,
    assessment: jobs.filter((job) => job.status === "assessment").length,
    interview: jobs.filter((job) => job.status === "interview").length,
    selected: jobs.filter((job) => job.status === "selected").length,
    rejected: jobs.filter((job) => job.status === "rejected").length,
  };

  const selected = counts.selected;
  const rejected = counts.rejected;

  const successRate =
    total > 0 ? Math.round((selected / total) * 100) : 0;

  const scheduled = interviews.filter(
    (item) => item.status === "scheduled"
  ).length;

  const completed = interviews.filter(
    (item) => item.status === "completed"
  ).length;

  // Status distribution.
  const statusData = [
    { name: "Applied", value: counts.applied },
    { name: "Assessment", value: counts.assessment },
    { name: "Interview", value: counts.interview },
    { name: "Selected", value: counts.selected },
    { name: "Rejected", value: counts.rejected },
  ].filter((item) => item.value > 0);

  // Monthly application trends.
  const monthlyData = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - (5 - index),
        1
      );

      const month = date.toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });

      const count = jobs.filter((job) => {
        if (!job.appliedDate) return false;

        const applied = new Date(job.appliedDate);

        return (
          applied.getMonth() === date.getMonth() &&
          applied.getFullYear() === date.getFullYear()
        );
      }).length;

      return {
        month,
        applications: count,
      };
    });
  }, [jobs]);

  const stats = [
    {
      title: "Total Applications",
      value: total,
      icon: BriefcaseBusiness,
      color: "text-blue-300",
      bg: "bg-blue-500/10",
    },
    {
      title: "Selected",
      value: selected,
      icon: CheckCircle2,
      color: "text-emerald-300",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "text-red-300",
      bg: "bg-red-500/10",
    },
    {
      title: "Scheduled Interviews",
      value: scheduled,
      icon: CalendarDays,
      color: "text-purple-300",
      bg: "bg-purple-500/10",
    },
  ];

  const tooltipStyle = {
    backgroundColor: "#15152a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#fff",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* INTRODUCTION */}

      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-700/30 via-indigo-700/20 to-blue-700/20 p-6 sm:p-8">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />

        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-purple-300">
            <Activity size={19} />
            <span className="text-xs font-semibold uppercase tracking-widest">
              Performance insights
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Your Career Analytics
          </h2>

          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Understand your application progress, monitor interview
            activity and measure your job-search performance.
          </p>
        </div>
      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -5 }}
              className="glass glass-hover rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    {item.title}
                  </p>

                  <h3 className="mt-3 text-3xl font-bold text-white">
                    {item.value}
                  </h3>
                </div>

                <div className={`rounded-xl p-3 ${item.bg} ${item.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SUCCESS RATE */}

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="text-purple-300" size={22} />

              <h3 className="text-lg font-bold text-white">
                Selection Success Rate
              </h3>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Percentage of applications resulting in selection
            </p>
          </div>

          <div className="text-4xl font-extrabold gradient-text">
            {successRate}%
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${successRate}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {selected} selected out of {total} total applications
        </p>
      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* PIE CHART */}

        <div className="glass rounded-2xl p-5 sm:p-6">
          <h3 className="text-lg font-bold text-white">
            Application Distribution
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Breakdown by application status
          </p>

          {statusData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-sm text-slate-400">
              No application data available yet.
            </div>
          ) : (
            <>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                {statusData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 text-xs text-slate-300"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[index % COLORS.length],
                      }}
                    />

                    {item.name}: {item.value}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* MONTHLY BAR CHART */}

        <div className="glass rounded-2xl p-5 sm:p-6">
          <h3 className="text-lg font-bold text-white">
            Monthly Applications
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Applications submitted over the last six months
          </p>

          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />

                <Tooltip contentStyle={tooltipStyle} />

                <Bar
                  dataKey="applications"
                  name="Applications"
                  fill="#8b5cf6"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* INTERVIEW INSIGHTS */}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-300">
              <CalendarDays size={23} />
            </div>

            <div>
              <h3 className="font-bold text-white">
                Interview Activity
              </h3>

              <p className="text-xs text-slate-400">
                Your interview progress
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Scheduled</p>
              <p className="mt-1 text-3xl font-bold text-blue-300">
                {scheduled}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Completed</p>
              <p className="mt-1 text-3xl font-bold text-emerald-300">
                {completed}
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-3 text-purple-300">
              <TrendingUp size={23} />
            </div>

            <div>
              <h3 className="font-bold text-white">
                Job Search Summary
              </h3>

              <p className="text-xs text-slate-400">
                Your current application pipeline
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">
                In assessment
              </span>

              <span className="font-semibold text-amber-300">
                {counts.assessment}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                In interview stage
              </span>

              <span className="font-semibold text-purple-300">
                {counts.interview}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Awaiting response
              </span>

              <span className="font-semibold text-blue-300">
                {counts.applied}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Analytics;
